import {Injectable} from '@nestjs/common'
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import {User} from '../users/entities/user.entity'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {Auth} from './models/auth.model'
import {CryptService} from '../crypt/crypt.service'

export type JwtPayload = {sub: User['id']}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authConfigService: AuthConfigService,
    private readonly cryptService: CryptService,
  ) {}

  public async login(userID: User['id']): Promise<Auth> {
    const tokens = await this.getTokens(userID)
    await this.updateRefreshToken(userID, tokens.refresh_token)
    return tokens
  }

  public async logout(userID: User['id']): Promise<void> {
    await this.usersService.updateRefreshToken(userID, null)
  }

  public async refreshTokens(userID: User['id']): Promise<Auth> {
    const tokens = await this.getTokens(userID)
    await this.updateRefreshToken(userID, tokens.refresh_token)
    return tokens
  }

  private async updateRefreshToken(userID: User['id'], refreshToken: string): Promise<void> {
    const hashToken = await this.cryptService.hashText(refreshToken)
    await this.usersService.updateRefreshToken(userID, hashToken)
  }

  private async getTokens(userID: User['id']): Promise<Auth> {
    const payload: JwtPayload = {sub: userID}
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
