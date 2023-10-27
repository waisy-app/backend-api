export type JwtSecretTokenType = string
export const JWT_SECRET_TOKEN = {
  name: 'JWT_SECRET_TOKEN',
  minLength: 128,
  required: true,
}

export type JwtAccessTokenExpiresInType = string
export const JWT_ACCESS_TOKEN_EXPIRES_IN = {
  name: 'JWT_ACCESS_TOKEN_EXPIRES_IN',
  default: '15d',
}

export type JwtRefreshSecretTokenType = string
export const JWT_REFRESH_SECRET_TOKEN = {
  name: 'JWT_REFRESH_SECRET_TOKEN',
  minLength: 128,
  required: true,
}

export type JwtRefreshTokenExpiresInType = string
export const JWT_REFRESH_TOKEN_EXPIRES_IN = {
  name: 'JWT_REFRESH_TOKEN_EXPIRES_IN',
  default: '60d',
}

export type HashRoundsType = number
export const HASH_ROUNDS = {
  name: 'HASH_ROUNDS',
  defaultValue: 10,
}
