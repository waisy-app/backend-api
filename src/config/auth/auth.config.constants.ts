export type JwtSecretTokenType = string
export const JWT_SECRET_TOKEN = {
  name: 'JWT_SECRET_TOKEN',
  minLength: 128,
  required: true,
}

export type JwtAccessTokenExpiresInType = string
export const JWT_ACCESS_TOKEN_EXPIRES_IN = {
  name: 'JWT_ACCESS_TOKEN_EXPIRES_IN',
  default: '30d',
}
