import {User} from '../../users/entities/user.entity'

export interface Payload {
  sub: User['id']
  iat: number
  exp: number
}
