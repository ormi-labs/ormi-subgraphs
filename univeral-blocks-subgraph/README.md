# Deploy

> Ensure that [NodeJS](https://nodejs.org/en) and [PNPM](https://pnpm.io/) are installed

Run the following command to initialize the subgraph with the necessary fields
```shell
./init.sh
```

On your first run, you will get an error about a key. Add the key to the list of keys in the [.keys.json5](.keys.json5) file. If you don't have the key, you can get it from the dashboard

> If the required env or chain is not present in the list, add it to the [envs](./envs) folder (use existing envs as an example), and open a PR to this repository.


```shell
pnpm install

pnpm run build
pnpm run create
pnpm run deploy
```

# Query

When subgraph has successfully been deployed, it returns the URL to **The
GraphiQL** to run queries in. Use _**schema.graphql**_ file to see available
types to build a query. For example, with the next type structure:

```graphql
type Block @entity(immutable:true) {
  "block hash"
  id: Bytes!
  number: BigInt!
  timestamp: BigInt!
}
```

- first 100 blocks can be retrieved with:

```graphql
query {
  blocks(subgraphError: deny, first: 100) {
    id
    number
    timestamp
  }
}
```

- all the appended blocks between two dates can be retrieved:

```graphql
query BlocksBetweenDates($timestamp_start: BigInt!, $timestamp_end: BigInt!) {
  blocks(where: { timestamp_gt: $timestamp_start, timestamp_lt: $timestamp_end }) {
    id
    number
    timestamp
  }
}
```
