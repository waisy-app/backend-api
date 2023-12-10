import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {UsersService} from '../../users/users.service'
import {JWT_STRATEGY_NAME} from './strategies.constants'
import {JwtPayload} from '../auth.service'
import {User} from '../../users/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  private readonly logger = new Logger(JwtStrategy.name)

  constructor(
    authConfigService: AuthConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfigService.jwtAccessSecretToken,
    })
  }

  public async validate(payload: JwtPayload): Promise<User> {
    this.logger.debug({message: 'Validating JWT payload', payload})
    const user = await this.usersService.getUserById(payload.sub)
    if (!user) throw new UnauthorizedException()
    return user
  }
}
