export type GraphqlAutoSchemaBuildType = boolean
export const GRAPHQL_AUTO_SCHEMA_BUILD = {
  name: 'GRAPHQL_AUTO_SCHEMA_BUILD',
  defaultValue: false,
}

export type GraphqlComplexityLimitType = number
export const GRAPHQL_COMPLEXITY_LIMIT = {
  name: 'GRAPHQL_COMPLEXITY_LIMIT',
  defaultValue: 100,
  min: 1,
}
