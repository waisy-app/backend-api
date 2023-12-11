import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {EmailVerificationCode as VerificationCode} from './entities/email-verification-code.entity'
import {UsersService} from '../users/users.service'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {User} from '../users/entities/user.entity'
import {Auth} from '../auth/models/auth.model'
import {AuthService} from '../auth/auth.service'

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name)
  private readonly verificationCodeLifetimeMs: number

  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    emailVerificationConfig: EmailVerificationConfigService,
  ) {
    this.verificationCodeLifetimeMs = emailVerificationConfig.verificationCodeLifetimeMilliseconds
  }

  public async sendVerificationCodeToEmail(email: string): Promise<void> {
    const user = await this.usersService.getOrCreateUserByEmail(email)
    const verificationCode = await this.getOrCreateVerificationCodeByUser(user)

    // TODO: Here you should implement the actual logic to send the email
    this.logger.debug(`Sending the verification code "${verificationCode.code}" to "${email}"`)
  }

  public async verifyEmail(email: string, code: number): Promise<Auth> {
    const user = await this.usersService.getUserByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Invalid verification code')
    }

    const verificationCode = await this.getActiveVerificationCodeByUser(user)
    if (verificationCode?.code !== code) {
      throw new UnauthorizedException('Invalid verification code')
    }

    verificationCode.status = 'used'
    await this.verificationCodeRepository.save(verificationCode)
    return this.authService.login(user.id)
  }

  private generateRandomCode(): number {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000
  }

  private async getOrCreateVerificationCodeByUser(user: User): Promise<VerificationCode> {
    const verificationCode = await this.getActiveVerificationCodeByUser(user)
    if (verificationCode) return verificationCode
    return this.createVerificationCodeByUser(user)
  }

  private createVerificationCodeByUser(user: User): Promise<VerificationCode> {
    const code = this.generateRandomCode()
    const expirationDate = new Date(Date.now() + this.verificationCodeLifetimeMs)
    return this.createVerificationCode({user, code, expirationDate})
  }

  private getActiveVerificationCodeByUser(user: User): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user: {id: user.id}, status: 'active'},
    })
  }

  private createVerificationCode(
    data: Pick<VerificationCode, 'user' | 'code' | 'expirationDate'>,
  ): Promise<VerificationCode> {
    const verificationCode = this.verificationCodeRepository.create(data)
    return this.verificationCodeRepository.save(verificationCode)
  }
}
