import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {Request} from 'express'
import {Injectable, UnauthorizedException} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {JWT_REFRESH_STRATEGY_NAME} from './strategies.constants'
import {UsersService} from '../../users/users.service'
import {JwtPayload} from '../auth.service'
import {ICurrentUser} from '../decorators/current-user.decorator'
import {CryptService} from '../../crypt/crypt.service'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY_NAME) {
  constructor(
    private readonly authConfigService: AuthConfigService,
    private readonly usersService: UsersService,
    private readonly cryptService: CryptService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfigService.jwtRefreshSecretToken,
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: JwtPayload): Promise<ICurrentUser> {
    const authRefreshToken = req.get('Authorization')?.replace('Bearer', '').trim()
    if (!authRefreshToken) throw new UnauthorizedException('Refresh token not found')

    const userID = payload.sub
    const user = await this.usersService.findOneByID(userID)
    const isTokenMatch = await this.cryptService.compareHash(
      authRefreshToken,
      `${user?.refreshToken}`,
    )
    if (!user || !isTokenMatch) throw new UnauthorizedException()
    return {id: user.id, email: user.email}
  }
}
