export type JwtSecretTokenType = string
export const JWT_SECRET_TOKEN = {
  name: 'JWT_SECRET_TOKEN',
  minLength: 128,
  required: true,
}
