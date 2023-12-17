import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {UsersService} from '../../users/users.service'
import {User} from '../../users/entities/user.entity'

export const JWT_ACCESS_TOKEN_STRATEGY = 'jwt-access-token'

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, JWT_ACCESS_TOKEN_STRATEGY) {
  private readonly logger = new Logger(JwtAccessTokenStrategy.name)

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

  public async validate(payload: {sub: string}): Promise<User> {
    this.logger.debug({message: 'Validating JWT payload', payload})
    const user = await this.usersService.getUserById(payload.sub)
    if (!user) throw new UnauthorizedException()
    return user
  }
}
