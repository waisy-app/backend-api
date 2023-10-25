import {User} from '../../users/entities/user.entity'

export class Payload {
  sub: User['id']
  iat: number
  exp: number
}
