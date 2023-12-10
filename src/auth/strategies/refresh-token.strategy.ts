import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {Request} from 'express'
import {Injectable, UnauthorizedException} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {JWT_REFRESH_STRATEGY_NAME} from './strategies.constants'
import {UsersService} from '../../users/users.service'
import {JwtPayload} from '../auth.service'
import {CryptService} from '../../crypt/crypt.service'
import {User} from '../../users/entities/user.entity'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY_NAME) {
  constructor(
    authConfigService: AuthConfigService,
    private readonly usersService: UsersService,
    private readonly cryptService: CryptService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfigService.jwtRefreshSecretToken,
      passReqToCallback: true,
    })
  }

  public async validate(req: Request, payload: JwtPayload): Promise<User> {
    const authRefreshToken = req.get('Authorization')?.replace('Bearer', '').trim()
    if (!authRefreshToken) throw new UnauthorizedException('Refresh token not found')

    const userID = payload.sub
    const user = await this.usersService.getUserById(userID)
    const isTokenMatch = await this.cryptService.compareHash(
      authRefreshToken,
      `${user?.refreshToken}`,
    )
    if (!user || !isTokenMatch) throw new UnauthorizedException()
    return user
  }
}
