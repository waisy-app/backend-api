import {Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from '../users/entities/user.entity'
import {Repository} from 'typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {UsersService} from '../users/users.service'
import {ForbiddenError} from '@nestjs/apollo'

@Injectable()
export class VerificationCodesService {
  private readonly logger: Logger = new Logger(VerificationCodesService.name)

  constructor(
    @InjectRepository(VerificationCode)
    readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly usersService: UsersService,
  ) {}

  // TODO: сделать автоматическую очистку таблицы verification_codes от записей с истекшим сроком
  //  действия кода подтверждения почты. Срок действия кода подтверждения почты - 15 минут.
  async sendVerificationCode(email: User['email']): Promise<void> {
    let user = await this.usersService.findOneByEmail(email)
    if (!user) {
      this.logger.debug(`User with email ${email} not found. Creating new user...`)
      user = await this.usersService.createOrUpdate({email})
    }

    let verificationCode = await this.findOneByUserEmail(email)
    // TODO: magic number
    if (verificationCode && verificationCode.sendingAttempts >= 3) {
      throw new ForbiddenError('Too many attempts')
    } else if (!verificationCode) {
      verificationCode = await this.create(user.id, this.generateCode(), 1)
    } else {
      await this.incrementSendingAttempts(verificationCode.id)
    }

    this.logger.debug(`Sending verification code ${verificationCode.code} to ${user.email}`)

    // TODO: отправка кода подтверждения на почту
  }

  async findOne(
    user: {id: User['id']} | {email: User['email']},
    code: number,
  ): Promise<VerificationCode | null> {
    return this.verificationCodeRepository.findOne({
      where: {user, code},
      relations: ['user'],
    })
  }

  async deleteByID(id: VerificationCode['id']): Promise<void> {
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

  private generateCode(): number {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000
  }

  private create(
    userID: User['id'],
    code: number,
    sendingAttempts?: number,
  ): Promise<VerificationCode> {
    return this.verificationCodeRepository.save({user: {id: userID}, code, sendingAttempts})
  }
}
