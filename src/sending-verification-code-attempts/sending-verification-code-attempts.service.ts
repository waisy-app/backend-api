import {Injectable} from '@nestjs/common'
import {SendingVerificationCodeAttempt} from './entities/sending-verification-code-attempt.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {MoreThan, Repository} from 'typeorm'

@Injectable()
export class SendingVerificationCodeAttemptsService {
  constructor(
    @InjectRepository(SendingVerificationCodeAttempt)
    public readonly sendingVerificationCodeAttemptsRepository: Repository<SendingVerificationCodeAttempt>,
  ) {}

  public async create(sendingVerificationCodeAttempt: {
    ipAddress?: string | null
    targetEmail: string
  }): Promise<SendingVerificationCodeAttempt> {
    const newSendingVerificationCodeAttempt = this.sendingVerificationCodeAttemptsRepository.create(
      sendingVerificationCodeAttempt,
    )
    return this.sendingVerificationCodeAttemptsRepository.save(newSendingVerificationCodeAttempt)
  }

  public async findByIpWhereCreatedAtMoreThen(
    date: Date,
    ipAddress: string,
  ): Promise<SendingVerificationCodeAttempt[]> {
    return this.sendingVerificationCodeAttemptsRepository.findBy({
      createdAt: MoreThan(date),
      ipAddress,
    })
  }
}
