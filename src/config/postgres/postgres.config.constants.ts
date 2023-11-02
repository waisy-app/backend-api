export type PostgresUsernameType = string
export const POSTGRES_USERNAME = {
  name: 'POSTGRES_USERNAME',
  required: true,
}

export type PostgresHostType = string
export const POSTGRES_HOST = {
  name: 'POSTGRES_HOST',
  required: true,
}

export type PostgresPortType = number
export const POSTGRES_PORT = {
  name: 'POSTGRES_PORT',
  required: true,
}

export type PostgresPasswordType = string
export const POSTGRES_PASSWORD = {
  name: 'POSTGRES_PASSWORD',
  required: true,
}

export type PostgresDatabaseType = string
export const POSTGRES_DATABASE = {
  name: 'POSTGRES_DATABASE',
  required: true,
}

export type PostgresSynchronizeType = boolean
export const POSTGRES_SYNCHRONIZE = {
  name: 'POSTGRES_SYNCHRONIZE',
  defaultValue: false,
}

export type PostgresMigrationsRunType = boolean
export const POSTGRES_MIGRATIONS_RUN = {
  name: 'POSTGRES_MIGRATIONS_RUN',
  defaultValue: false,
}
