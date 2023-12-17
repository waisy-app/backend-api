import {Injectable} from '@nestjs/common'
import {Tokens as Tokens} from './models/tokens.model'
import {JwtService} from '@nestjs/jwt'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {Repository} from 'typeorm'
import {RefreshToken} from './entities/refresh-token.entity'
import {CryptService} from '../crypt/crypt.service'
import {User} from '../users/entities/user.entity'
import {InjectRepository} from '@nestjs/typeorm'

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authConfigService: AuthConfigService,
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
    private readonly cryptService: CryptService,
  ) {}

  public getActiveTokenByUserAndDeviceInfo(
    user: User,
    deviceInfo: string,
  ): Promise<RefreshToken | null> {
    return this.tokenRepository.findOne({
      where: {user: {id: user.id}, deviceInfo, status: 'active'},
    })
  }

  public async deactivateTokensByUser(user: User): Promise<void> {
    await this.tokenRepository.update({user: {id: user.id}}, {status: 'inactive'})
  }

  public async deactivateTokenByUserAndDeviceInfo(user: User, deviceInfo: string): Promise<void> {
    await this.tokenRepository.update({user: {id: user.id}, deviceInfo}, {status: 'inactive'})
  }

  public async generateAndSaveTokens(user: User, deviceInfo: string): Promise<Tokens> {
    const tokens = await this.generateTokens(user.id, deviceInfo)
    await this.createAuthToken({
      user,
      refreshToken: tokens.refresh_token,
      deviceInfo,
    })
    return tokens
  }

  private async createAuthToken(data: {
    user: User
    refreshToken: string
    deviceInfo: string
  }): Promise<RefreshToken> {
    const hashRefreshToken = await this.cryptService.hashText(data.refreshToken)
    const newAuthToken = this.tokenRepository.create({...data, refreshToken: hashRefreshToken})
    return this.tokenRepository.save(newAuthToken)
  }

  private async generateTokens(userId: string, deviceInfo: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {sub: userId},
        {
          expiresIn: this.authConfigService.jwtAccessTokenExpiresIn,
          secret: this.authConfigService.jwtAccessSecretToken,
        },
      ),
      this.jwtService.signAsync(
        {sub: userId, deviceInfo},
        {
          expiresIn: this.authConfigService.jwtRefreshTokenExpiresIn,
          secret: this.authConfigService.jwtRefreshSecretToken,
        },
      ),
    ])
    return {access_token, refresh_token}
  }
}
