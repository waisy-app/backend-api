import {ForbiddenException, Injectable} from '@nestjs/common'
import {Repository} from 'typeorm'
import {EmailVerificationCodeInputAttempt as InputAttempt} from './entities/email-verification-code-input-attempt.entity'
import {EmailVerificationConfigService} from '../config/email-verification/email-verification.config.service'
import {InjectRepository} from '@nestjs/typeorm'

@Injectable()
export class EmailVerificationInputLimitService {
  private readonly codeLifetimeMs: number
  private readonly maxAttempts: number

  constructor(
    @InjectRepository(InputAttempt)
    private readonly inputAttemptRepository: Repository<InputAttempt>,
    emailVerificationConfigService: EmailVerificationConfigService,
  ) {
    this.codeLifetimeMs = emailVerificationConfigService.verificationCodeLifetimeMilliseconds
    this.maxAttempts = emailVerificationConfigService.maxInputVerificationCodeAttempts
  }

  public async enforceEmailVerificationInputLimit(senderIp: string, email: string): Promise<void> {
    const attemptsCount = await this.getAttemptsCount(senderIp)
    if (attemptsCount >= this.maxAttempts) {
      throw new ForbiddenException('Max input attempts exceeded')
    }
    await this.createInputAttempt({senderIp, email})
  }

  private getAttemptsCount(senderIp: string): Promise<number> {
    return this.inputAttemptRepository.count({
      where: {senderIp, createdAt: new Date(new Date().getTime() - this.codeLifetimeMs)},
      cache: false,
      take: this.maxAttempts,
    })
  }

  private createInputAttempt(
    data: Pick<InputAttempt, 'senderIp' | 'email'>,
  ): Promise<InputAttempt> {
    const sendingAttempt = this.inputAttemptRepository.create(data)
    return this.inputAttemptRepository.save(sendingAttempt)
  }
}
