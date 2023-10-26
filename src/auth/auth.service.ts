import {Injectable} from '@nestjs/common'
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import {User} from '../users/entities/user.entity'
import {Payload} from './entities/payload.entity'
import {AuthConfigService} from '../config/auth/auth.config.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async login(userID: User['id']) {
    const tokens = await this.getTokens(userID)
    await this.updateRefreshToken(userID, tokens.refresh_token)
    return tokens
  }

  async validateUser(email: string, password: string): Promise<{id: User['id']} | null> {
    const user = await this.usersService.findOneByEmail(email)
    if (user?.password === password) {
      return {id: user.id}
    }
    return null
  }

  private async updateRefreshToken(userID: User['id'], refreshToken: string) {
    // TODO: хешировать refreshToken перед добавлением в бд
    await this.usersService.update(userID, {refreshToken})
  }

  async logout(userID: User['id']) {
    await this.usersService.update(userID, {refreshToken: undefined})
  }

  async refreshTokens(userID: User['id']) {
    const tokens = await this.getTokens(userID)
    await this.updateRefreshToken(userID, tokens.refresh_token)
    return tokens
  }

  private async getTokens(userID: User['id']) {
    const payload: Omit<Omit<Payload, 'iat'>, 'exp'> = {sub: userID}
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.authConfigService.jwtRefreshTokenExpiresIn,
        secret: this.authConfigService.jwtRefreshSecretToken,
      }),
    ])
    return {access_token, refresh_token}
  }
}
