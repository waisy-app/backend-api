import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {Payload} from '../entities/payload.entity'
import {UsersService} from '../../users/users.service'
import {JWT_STRATEGY_NAME} from './strategies.constants'
import {User} from '../../users/models/user.model'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  private readonly logger = new Logger(JwtStrategy.name)

  constructor(
    private readonly authConfigService: AuthConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfigService.jwtSecretToken,
    })
  }

  async validate(payload: Payload): Promise<User> {
    this.logger.debug({message: 'Validating JWT payload', payload})
    const user = await this.usersService.findOneByID(payload.sub)
    if (!user) throw new UnauthorizedException()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, refreshToken, ...result} = user
    return result
  }
}
