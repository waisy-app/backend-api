import {Injectable, Logger, ForbiddenException} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {MoreThan, Repository} from 'typeorm'
import {EmailVerificationCodeSendingAttempt as SendingAttempt} from './entities/email-verification-code-sending-attempt.entity'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'

@Injectable()
export class EmailVerificationSendingLimitService {
  private readonly logger = new Logger(EmailVerificationSendingLimitService.name)
  private readonly maxSendingAttempts: number
  private readonly lifetimeMilliseconds: number
  private readonly lifetimeMinutes: number

  constructor(
    @InjectRepository(SendingAttempt)
    private readonly sendingAttemptRepository: Repository<SendingAttempt>,
    emailVerificationConfig: EmailVerificationConfigService,
  ) {
    this.maxSendingAttempts = emailVerificationConfig.maxSendingVerificationCodeAttempts
    this.lifetimeMilliseconds = emailVerificationConfig.verificationCodeLifetimeMilliseconds
    this.lifetimeMinutes = emailVerificationConfig.verificationCodeLifetimeMinutes
  }

  public async enforceEmailVerificationSendingLimit(
    senderIp: string,
    email: string,
  ): Promise<void> {
    const sendingAttemptsCount = await this.getSendingAttemptsCount(senderIp, email)
    if (sendingAttemptsCount >= this.maxSendingAttempts) {
      throw new ForbiddenException(
        `You have exceeded the limit of email verification requests for the last ${this.lifetimeMinutes} minutes.`,
      )
    }
    await this.createSendingAttempt({senderIp, email})
  }

  private async getSendingAttemptsCount(senderIp: string, email: string): Promise<number> {
    const timeThreshold = new Date(Date.now() - this.lifetimeMilliseconds)
    const sendingAttemptsCount = await this.sendingAttemptRepository.count({
      where: {senderIp, createdAt: MoreThan(timeThreshold)},
      take: this.maxSendingAttempts,
      cache: false,
    })
    this.logger.debug({
      message: 'Sending attempt',
      sendingAttemptsCount,
      senderIp,
      email,
    })
    return sendingAttemptsCount
  }

  private createSendingAttempt(
    data: Pick<SendingAttempt, 'senderIp' | 'email'>,
  ): Promise<SendingAttempt> {
    const sendingAttempt = this.sendingAttemptRepository.create(data)
    return this.sendingAttemptRepository.save(sendingAttempt)
  }
}
