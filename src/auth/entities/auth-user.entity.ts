import {Payload} from './payload.entity'

export class AuthUser extends Payload {
  iat: number
  exp: number
}
