#!/usr/bin/env bash

set -e

rm -f package.json
rm -f subgraph.yaml
cp package.json.example package.json
if [ ! -e .keys.json5 ]; then
    echo "{" > .keys.json5
    echo "  // \"chainstack\": \"XXXXXXXXXXXX\"," >> .keys.json5
    echo "  // \"apechain\": \"XXXXXXXXXXXX\"," >> .keys.json5
    echo "  // \"0xgraph\": \"XXXXXXXXXXXX\"," >> .keys.json5
    echo "}" >> .keys.json5
fi
pnpm i
node ./prepare.mjs
echo "Initialization done. Run \`pnpm run build\` and \`pnpm run deploy\` to deploy the subgraph, or \`pnpm run bd\` to do it in one command"
