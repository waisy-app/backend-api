import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {UsersService} from '../../users/users.service'
import {JWT_STRATEGY_NAME} from './strategies.constants'
import {JwtPayload} from '../auth.service'
import {ICurrentUser} from '../decorators/current-user.decorator'

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
      secretOrKey: authConfigService.jwtSecretToken,
    })
  }

  public async validate(payload: JwtPayload): Promise<ICurrentUser> {
    this.logger.debug({message: 'Validating JWT payload', payload})
    const user = await this.usersService.findOneByID(payload.sub)
    if (!user) throw new UnauthorizedException()
    return {id: user.id, email: user.email}
  }
}
