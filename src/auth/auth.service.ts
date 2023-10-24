import {Injectable, UnauthorizedException} from '@nestjs/common'
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {Payload} from './entities/payload.entity'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private authConfigService: AuthConfigService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email)
    if (user?.password !== password) {
      throw new UnauthorizedException('Wrong email or password')
    }
    const payload: Payload = {sub: user.id, email: user.email}
    return {
      access_token: this.jwtService.sign(payload, {secret: this.authConfigService.jwtSecretToken}),
    }
  }
}
