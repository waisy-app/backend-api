export type JwtSecretTokenType = string
export const JWT_SECRET_TOKEN = {
  name: 'JWT_SECRET_TOKEN',
  minLength: 128,
  required: true,
}

export type JwtAccessTokenExpiresInType = string
export const JWT_ACCESS_TOKEN_EXPIRES_IN = {
  name: 'JWT_ACCESS_TOKEN_EXPIRES_IN',
  default: '1h',
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

export type MaxSendingVerificationCodeAttemptsType = number
export const MAX_SENDING_VERIFICATION_CODE_ATTEMPTS = {
  name: 'MAX_SENDING_VERIFICATION_CODE_ATTEMPTS',
  defaultValue: 3,
}

export type VerificationCodeLifetimeSecondsType = number
export const VERIFICATION_CODE_LIFETIME_SECONDS = {
  name: 'VERIFICATION_CODE_LIFETIME_SECONDS',
  defaultValue: 60 * 10, // 10 minutes
}
