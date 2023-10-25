import {Strategy} from 'passport-local'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, UnauthorizedException} from '@nestjs/common'
import {AuthService} from '../auth.service'
import {LOCAL_STRATEGY_NAME} from './strategies.constants'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_STRATEGY_NAME) {
  constructor(private readonly authService: AuthService) {
    super({usernameField: 'email', passwordField: 'password'})
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password)
    if (!user) throw new UnauthorizedException('Wrong email or password')
    return user
  }
}
