# Ormi Subgraphs

A centralized repository for subgraph mappings, deployment workflows, and development standards. This collection serves as the reference implementation for internal and partner subgraphs within the Ormi ecosystem.

## Repository Structure

- **/subgraphs**: Directory for individual subgraph logic, including `subgraph.yaml`, GraphQL schemas, and AssemblyScript mappings.
- **/docs**: Technical guides for infrastructure setup and environment-specific configurations.
- **/templates**: Boilerplate configurations for rapid subgraph initialization.

## Getting Started

### Prerequisites

- **Ormi CLI**: Ensure the latest version of [ormi-cli](https://github.com/ormi-labs/ormi-cli) is installed and configured in your path.
- **Access**: Valid credentials for the Ormi infrastructure.

### Deployment Workflow

Standard procedure for preparing and shipping subgraphs:

1.  **Generate Types**: `ormi-cli codegen`
2.  **Build**: `ormi-cli build`
3.  **Deploy**: `ormi-cli deploy <SUBGRAPH_NAME>`

## Standards & Best Practices

To maintain consistency across the Ormi ecosystem, all contributions should follow these guidelines:

- **Self-Documenting Code**: Mappings must be written for high readability, favoring clean logic over inline comments.
- **Event Handling**: Use optimized handlers to ensure fast indexing and avoid `stuck` subgraphs.
- **Schema Design**: Organize entities to minimize store lookups and support efficient Data API queries.
