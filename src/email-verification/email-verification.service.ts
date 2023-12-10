import {Injectable, Logger, ForbiddenException} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {MoreThan, Repository} from 'typeorm'
import {EmailVerificationCodeSendingAttempt as SendingAttempt} from './entities/email-verification-code-sending-attempt.entity'
import {EmailVerificationCode as VerificationCode} from './entities/email-verification-code.entity'
import {UsersService} from '../users/users.service'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {User} from '../users/entities/user.entity'

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name)
  private readonly maxSendingAttempts: number
  private readonly lifetimeMilliseconds: number

  constructor(
    @InjectRepository(SendingAttempt)
    private readonly sendingAttemptRepository: Repository<SendingAttempt>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly usersService: UsersService,
    emailVerificationConfig: EmailVerificationConfigService,
  ) {
    this.maxSendingAttempts = emailVerificationConfig.maxSendingVerificationCodeAttempts
    this.lifetimeMilliseconds = emailVerificationConfig.verificationCodeLifetimeMilliseconds
  }

  // TODO: метод проверки введенного кода

  // TODO: вынести email verification sending attempt в отдельный сервис и все методы, связанные с ним
  public async enforceEmailVerificationSendingLimit(
    senderIp: string,
    email: string,
  ): Promise<void> {
    const tenMinutesAgo = new Date(Date.now() - this.lifetimeMilliseconds)
    const sendingAttemptsCount = await this.sendingAttemptRepository.count({
      where: {senderIp, createdAt: MoreThan(tenMinutesAgo)},
      take: this.maxSendingAttempts,
      cache: false,
    })
    if (sendingAttemptsCount >= this.maxSendingAttempts) {
      throw new ForbiddenException(
        'You have exceeded the limit of email verification requests for the last 10 minutes.',
      )
    }
    await this.createSendingAttempt({senderIp, email})
  }

  public async sendVerificationCodeToEmail(email: string): Promise<void> {
    const user = await this.usersService.getOrCreateUserByEmail(email)
    const verificationCode = await this.getOrCreateVerificationCodeByUser(user)

    // TODO: Here you should implement the actual logic to send the email
    this.logger.debug(`Sending the verification code "${verificationCode.code}" to "${email}"`)
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
    const verificationCode = this.verificationCodeRepository.create({
      user,
      code: this.generateRandomCode(),
      expirationDate: new Date(Date.now() + this.lifetimeMilliseconds),
    })
    return this.verificationCodeRepository.save(verificationCode)
  }

  private getActiveVerificationCodeByUser(user: User): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user: {id: user.id}, status: 'active'},
    })
  }

  private async createSendingAttempt({
    senderIp,
    email,
  }: Pick<SendingAttempt, 'senderIp' | 'email'>): Promise<SendingAttempt> {
    const sendingAttempt = this.sendingAttemptRepository.create({senderIp, email})
    return this.sendingAttemptRepository.save(sendingAttempt)
  }
}
