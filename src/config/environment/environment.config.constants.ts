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

export type AppNameType = string
export const APP_NAME = {
  name: 'APP_NAME',
  defaultValue: 'NEST',
}
