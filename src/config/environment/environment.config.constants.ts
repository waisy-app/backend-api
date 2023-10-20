export type NodeEnvType = 'development' | 'production' | 'test'
export const NODE_ENV = {
  name: 'NODE_ENV',
  options: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
  },
  defaultValue: 'production',
}

export type TestType = 1
export const TEST = {
  name: 'TEST',
  defaultValue: 1,
}