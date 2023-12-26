import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {Request} from 'express'
import {Injectable} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {UsersService} from '../../users/users.service'
import {User} from '../../users/entities/user.entity'
import {RefreshTokenService} from '../refresh-token.service'
import {CryptService} from '../../crypt/crypt.service'
import {UnauthorizedError} from '../../errors/general-errors/unauthorized.error'

export const JWT_REFRESH_TOKEN_STRATEGY = 'jwt-refresh-token'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_TOKEN_STRATEGY,
) {
  constructor(
    authConfigService: AuthConfigService,
    private readonly usersService: UsersService,
    private readonly authTokensService: RefreshTokenService,
    private readonly cryptService: CryptService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfigService.jwtRefreshSecretToken,
      passReqToCallback: true,
    })
  }

  public async validate(req: Request, payload: {sub: string; deviceInfo: string}): Promise<User> {
    const refreshToken = req.get('Authorization')?.replace('Bearer ', '')
    if (!refreshToken) throw new UnauthorizedError('Refresh token not found')

    const user = await this.usersService.getUserById(payload.sub)
    const authToken = await (user &&
      this.authTokensService.getActiveTokenByUserAndDeviceInfo(user, payload.deviceInfo))
    const isRefreshTokenValid = await (authToken &&
      this.cryptService.compareHash(refreshToken, authToken.refreshToken))

    if (!user || !authToken || !isRefreshTokenValid) {
      throw new UnauthorizedError('Invalid refresh token')
    }

    return user
  }
}
