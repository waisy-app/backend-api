import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {UsersService} from '../../users/users.service'
import {User} from '../../users/entities/user.entity'
import {UnauthorizedError} from '../../errors/general-errors/unauthorized.error'

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
    if (!user) throw new UnauthorizedError('Invalid access token')
    return user
  }
}
