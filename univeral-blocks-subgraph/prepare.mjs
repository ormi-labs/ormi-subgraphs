import { select } from "@inquirer/prompts";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import Mustache from "mustache";
import JSON5 from "json5";

const ENVS_DIR = "envs";

const envSchema = z.union([
	z.strictObject({
		node: z.string(),
		ipfs: z.string(),
		networks: z.array(z.string()),
	}),
	z.strictObject({
		env: z.string(),
		networks: z.array(z.string()),
	}),
]);

/**
 * @typedef {z.infer<typeof envSchema>} EnvType
 */

/**
 * @typedef {EnvType & {name: string, key: string}} EnvWithKey
 */

/**
 *
 * @template {z.ZodType<any, any, any>} T
 * @param {T} schema
 * @param {unknown} value
 * @returns {z.infer<T>}
 */
function zodParse(schema, value) {
	const result = schema.safeParse(value);
	if (result.success) {
		return result.data;
	}
	console.error(result.error.format());
	process.exit(1);
}

const keysBytes = await fs.readFile(".keys.json5");
const keys = zodParse(
	z.record(z.string(), z.string()),
	JSON5.parse(keysBytes.toString()),
);

const envs = await fs.readdir("envs");

/**
 * @type {{name: string, value: EnvWithKey}[]}
 */
const choices = [];

for (const env of envs) {
	const name = path.parse(env).name;
	const contentBytes = await fs.readFile(path.join(ENVS_DIR, env));
	const content = zodParse(envSchema, JSON5.parse(contentBytes.toString()));
	choices.push({
		name: name,
		value: {
			...content,
			key: keys[name],
			name: name,
		},
	});
}

const answer = await select({
	message: "Select the environment",
	choices,
});

const chain = await select({
	message: "Select the chain",
	choices: answer.networks.map((n) => ({ name: n, value: n })),
});

if (chain.length === 0) {
	console.error("Chain name is required");
	process.exit(1);
}

if (!answer.key) {
	console.error(
		`Key for ${answer.name} is not found. Please add it to .keys.json5 file and rerun the command.`,
	);
	process.exit(1);
}

const subgraphTemplate = await fs.readFile("subgraph.yaml.example");

const output = Mustache.render(subgraphTemplate.toString(), {
	network: chain,
});

await fs.writeFile("subgraph.yaml", output);

const pjsonBytes = await fs.readFile("package.json");
const pjson = JSON.parse(pjsonBytes.toString());

let ipfsArg;
let nodeAndIpfsArg;
let nodeArg;

if ("env" in answer) {
	nodeAndIpfsArg = `--env ${answer.env}`;
	ipfsArg = nodeAndIpfsArg;
	nodeArg = nodeAndIpfsArg;
} else {
	ipfsArg = `--ipfs ${answer.ipfs}`;
	nodeArg = `--node ${answer.node}`;
	nodeAndIpfsArg = `${nodeArg} ${ipfsArg}`;
}

pjson.scripts = {
	...pjson.scripts,
	codegen: `rimraf generated && ormi-cli codegen -o generated ${ipfsArg}`,
	build: "rimraf generated build && pnpm run codegen && ormi-cli build",
	create: `ormi-cli create ${chain}/min-blocks ${nodeArg} --deploy-key ${answer.key}`,
	deploy: `ormi-cli deploy ${chain}/min-blocks --version-label v1.0.0 ${nodeAndIpfsArg} --deploy-key ${answer.key}`,
	remove: `ormi-cli remove ${chain}/min-blocks --version-label v1.0.0 ${nodeArg} --deploy-key ${answer.key}`,
	bd: `pnpm run build && pnpm run deploy`,
};

pjson.name = `${chain}/min-blocks`;

await fs.writeFile("package.json", JSON.stringify(pjson, null, "\t"));

console.log("Subgraph boilerplate generated. You're ready to go!");
