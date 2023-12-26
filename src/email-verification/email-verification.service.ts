import {Inject, Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {MoreThan, Repository} from 'typeorm'
import {EmailVerificationCode as VerificationCode} from './entities/email-verification-code.entity'
import {UsersService} from '../users/users.service'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {User} from '../users/entities/user.entity'
import {RefreshTokenService} from '../refresh-token/refresh-token.service'
import {Tokens} from '../refresh-token/models/tokens.model'
import {UnisenderService} from '../unisender/unisender.service'
import {UnauthorizedError} from '../errors/general-errors/unauthorized.error'

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name)
  private readonly verificationCodeLifetimeMs: number

  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly usersService: UsersService,
    private readonly tokenService: RefreshTokenService,
    @Inject(UnisenderService)
    private readonly unisenderService: UnisenderService,
    emailVerificationConfig: EmailVerificationConfigService,
  ) {
    this.verificationCodeLifetimeMs = emailVerificationConfig.verificationCodeLifetimeMilliseconds
  }

  public async sendVerificationCodeToEmail(email: string): Promise<void> {
    const user = await this.usersService.getOrCreateUserByEmail(email)
    const verificationCode = await this.getOrCreateVerificationCodeByUser(user)

    await this.unisenderService.sendEmailVerification(email, verificationCode.code)
  }

  public async verifyEmail(email: string, code: number, deviceInfo: string): Promise<Tokens> {
    const user = await this.usersService.getUserByEmail(email)
    if (!user) {
      this.logger.debug(`User with email "${email}" not found`)
      throw new UnauthorizedError('Invalid verification code')
    }

    const verificationCode = await this.getActiveVerificationCodeByUser(user)
    if (verificationCode?.code !== code) {
      this.logger.debug(`Invalid verification code "${code}"`)
      throw new UnauthorizedError('Invalid verification code')
    }

    verificationCode.status = 'used'
    await this.verificationCodeRepository.save(verificationCode)
    return this.tokenService.generateAndSaveTokens(user, deviceInfo)
  }

  private generateRandomCode(): number {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000
  }

  private async getOrCreateVerificationCodeByUser(user: User): Promise<VerificationCode> {
    let verificationCode = await this.getActiveVerificationCodeByUser(user)
    if (!verificationCode) {
      const code = this.generateRandomCode()
      const expirationDate = new Date(Date.now() + this.verificationCodeLifetimeMs)
      verificationCode = await this.createVerificationCode({user, code, expirationDate})
    }
    return verificationCode
  }

  private getActiveVerificationCodeByUser(user: User): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user: {id: user.id}, status: 'active', expirationDate: MoreThan(new Date())},
    })
  }

  private createVerificationCode(
    data: Pick<VerificationCode, 'user' | 'code' | 'expirationDate'>,
  ): Promise<VerificationCode> {
    const verificationCode = this.verificationCodeRepository.create(data)
    return this.verificationCodeRepository.save(verificationCode)
  }
}
