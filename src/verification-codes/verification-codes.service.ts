import {Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from '../users/entities/user.entity'
import {Repository} from 'typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {UsersService} from '../users/users.service'
import {ForbiddenError} from '@nestjs/apollo'
import {AuthConfigService} from '../config/auth/auth.config.service'

@Injectable()
export class VerificationCodesService {
  private readonly logger: Logger = new Logger(VerificationCodesService.name)

  constructor(
    @InjectRepository(VerificationCode)
    public readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly usersService: UsersService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  // TODO: make automatic cleaning of verification_codes table
  //  from records with expired email verification code.
  //  Verification code expiration time - 15 minutes.
  public async sendEmailVerificationCode(email: User['email']): Promise<void> {
    const user =
      (await this.usersService.findOneByEmail(email)) ||
      (await this.usersService.createOrUpdate({email}))

    const maxSendingAttempts = this.authConfigService.maxSendingVerificationCodeAttempts
    let verificationCode = await this.findOneByUserEmail(email)
    if (verificationCode && verificationCode.sendingAttempts >= maxSendingAttempts) {
      throw new ForbiddenError('Too many attempts')
    } else if (!verificationCode) {
      verificationCode = await this.create(user.id, {
        code: this.generateRandomCode(),
        sendingAttempts: 1,
      })
    } else {
      await this.incrementSendingAttempts(verificationCode.id)
    }

    this.logger.debug(`Sending the verification code "${verificationCode.code}" to "${user.email}"`)
    // TODO: send email with verification code
  }

  public async findOne(
    user: {id: User['id']} | {email: User['email']},
    code: VerificationCode['code'],
  ): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user, code},
      relations: ['user'],
    })
  }

  public async deleteByID(id: VerificationCode['id']): Promise<void> {
    await this.verificationCodeRepository.delete({id})
  }

  private async findOneByUserEmail(email: User['email']): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user: {email}},
      relations: ['user'],
    })
  }

  private async incrementSendingAttempts(id: VerificationCode['id']): Promise<void> {
    await this.verificationCodeRepository.increment({id}, 'sendingAttempts', 1)
  }

  private generateRandomCode(): VerificationCode['code'] {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000
  }

  private create(
    userID: User['id'],
    {code, sendingAttempts}: Pick<VerificationCode, 'code' | 'sendingAttempts'>,
  ): Promise<VerificationCode> {
    const newVerificationCode = this.verificationCodeRepository.create({
      user: {id: userID},
      code,
      sendingAttempts,
    })
    return this.verificationCodeRepository.save(newVerificationCode)
  }
}
