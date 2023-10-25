import {Injectable} from '@nestjs/common'
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {User} from '../users/entities/user.entity'
import {Payload} from './entities/payload.entity'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private authConfigService: AuthConfigService,
  ) {}

  login(userID: User['id']) {
    const payload: Omit<Omit<Payload, 'iat'>, 'exp'> = {sub: userID}
    return {
      access_token: this.jwtService.sign(payload, {secret: this.authConfigService.jwtSecretToken}),
    }
  }

  async validateUser(email: string, password: string): Promise<{id: User['id']} | null> {
    const user = await this.usersService.findOneByEmail(email)
    if (user?.password === password) {
      return {id: user.id}
    }
    return null
  }
}
