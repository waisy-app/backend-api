import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from '../users/entities/user.entity'
import {MoreThan, Repository} from 'typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {UsersService} from '../users/users.service'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {SendingVerificationCodeAttemptsService} from '../sending-verification-code-attempts/sending-verification-code-attempts.service'

@Injectable()
export class VerificationCodesService {
  private readonly logger: Logger = new Logger(VerificationCodesService.name)

  constructor(
    @InjectRepository(VerificationCode)
    public readonly verificationCodeRepository: Repository<VerificationCode>,
    public readonly sendingVerificationCodeAttemptsService: SendingVerificationCodeAttemptsService,
    private readonly usersService: UsersService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  public async sendEmailVerificationCode(email: User['email'], clientIP: string): Promise<void> {
    const maxSendingAttempts = this.authConfigService.maxSendingVerificationCodeAttempts
    const verificationCode = await this.findOneOrCreateByUserEmail(email)

    const currentDate = new Date()
    // TODO: вынести в конфиг. Пользователь может отправить код подтверждения не более 3 раз в 10 минут
    const sendingVerificationCodeAttempts =
      await this.sendingVerificationCodeAttemptsService.findByIpWhereCreatedAtMoreThen(
        new Date(currentDate.getTime() - 10 * 60 * 1000),
        clientIP,
      )
    if (sendingVerificationCodeAttempts.length >= 3) {
      throw new UnauthorizedException('Too many sending attempts')
    }

    if (verificationCode.sendingAttempts >= maxSendingAttempts) {
      throw new UnauthorizedException('Too many attempts')
    }
    await this.incrementSendingAttempts(verificationCode.id)
    await this.sendingVerificationCodeAttemptsService.create({
      ipAddress: clientIP,
      targetEmail: email,
    })

    this.logger.debug(`Sending the verification code "${verificationCode.code}" to "${email}"`)
    // TODO: send email with verification code
  }

  public async findOneByUserAndCode(
    user: {id: User['id']} | {email: User['email']},
    code: VerificationCode['code'],
  ): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user, code},
      relations: ['user'],
    })
  }

  public async setStatusByID(
    id: VerificationCode['id'],
    status: VerificationCode['status'],
  ): Promise<void> {
    await this.verificationCodeRepository.update({id}, {status})
  }

  private async findOneByUserEmail(email: User['email']): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user: {email}, status: 'active', expirationDate: MoreThan(new Date())},
      relations: ['user'],
    })
  }

  private async incrementSendingAttempts(id: VerificationCode['id']): Promise<void> {
    await this.verificationCodeRepository.increment({id}, 'sendingAttempts', 1)
  }

  private generateRandomCode(): VerificationCode['code'] {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000
  }

  private createOne(userID: User['id'], code: VerificationCode['code']): Promise<VerificationCode> {
    const expirationDate = new Date(
      Date.now() + this.authConfigService.verificationCodeLifetimeMilliseconds,
    )
    const user = {id: userID}
    const newVerificationCode = this.verificationCodeRepository.create({
      user,
      code,
      expirationDate,
    })
    return this.verificationCodeRepository.save(newVerificationCode)
  }

  private async findOneOrCreateByUserEmail(email: User['email']): Promise<VerificationCode> {
    const user = await this.usersService.findOneOrCreateByEmail(email)
    const verificationCode = await this.findOneByUserEmail(email)
    if (verificationCode) return verificationCode
    return this.createOne(user.id, this.generateRandomCode())
  }
}
