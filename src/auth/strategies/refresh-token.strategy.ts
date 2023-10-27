import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {Request} from 'express'
import {ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common'
import {AuthConfigService} from '../../config/auth/auth.config.service'
import {JWT_REFRESH_STRATEGY_NAME} from './strategies.constants'
import {Payload} from '../entities/payload.entity'
import {UsersService} from '../../users/users.service'
import {AuthService} from '../auth.service'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY_NAME) {
  constructor(
    private readonly authConfigService: AuthConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfigService.jwtRefreshSecretToken,
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: Payload) {
    const authRefreshToken = req.get('Authorization')?.replace('Bearer', '').trim()
    if (!authRefreshToken) throw new UnauthorizedException('Refresh token not found')

    const userID = payload.sub
    const user = await this.usersService.findOneByID(userID)
    const isTokenMatch = await this.authService.compareHash(
      authRefreshToken,
      `${user?.refreshToken}`,
    )
    if (!user || !isTokenMatch) {
      throw new ForbiddenException('Access Denied')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, refreshToken, ...result} = user
    return result
  }
}
