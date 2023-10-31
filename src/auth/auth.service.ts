import {Injectable, Logger} from '@nestjs/common'
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import {User} from '../users/entities/user.entity'
import {Payload} from './types/payload.type'
import {AuthConfigService} from '../config/auth/auth.config.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

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

    if (!user) {
      this.logger.debug(`User with email ${email} not found. Creating new user...`)
      const hashedPassword = await this.hashText(password)
      const newUser = await this.usersService.create({email, password: hashedPassword})
      return {id: newUser.id}
    }

    const isPasswordMatch = await this.compareHash(password, user.password)
    if (isPasswordMatch) {
      return {id: user.id}
    }
    return null
  }

  async logout(userID: User['id']) {
    await this.usersService.update({id: userID, refreshToken: undefined})
  }

  async refreshTokens(userID: User['id']) {
    const tokens = await this.getTokens(userID)
    await this.updateRefreshToken(userID, tokens.refresh_token)
    return tokens
  }

  hashText(text: string) {
    return bcrypt.hash(text, this.authConfigService.hashRounds)
  }

  compareHash(text: string, hash: string) {
    return bcrypt.compare(text, hash)
  }

  private async updateRefreshToken(userID: User['id'], refreshToken: string) {
    const hashToken = await this.hashText(refreshToken)
    await this.usersService.update({refreshToken: hashToken, id: userID})
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
