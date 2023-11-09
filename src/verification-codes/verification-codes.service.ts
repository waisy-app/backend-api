import {Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from '../users/entities/user.entity'
import {Repository} from 'typeorm'
import {VerificationCode} from './entities/verification-code.entity'
import {UsersService} from '../users/users.service'

@Injectable()
export class VerificationCodesService {
  private readonly logger: Logger = new Logger(VerificationCodesService.name)

  constructor(
    @InjectRepository(VerificationCode)
    readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly usersService: UsersService,
  ) {}

  // TODO: сделать ограничения по количеству отправок кода подтверждения на почту
  // TODO: изменить алгоритм регистрации. Во время подтверждения пользователь не создается,
  //  а создается только после подтверждения почты (на этапе auth/login)
  async sendVerificationCode(email: User['email']): Promise<void> {
    let user = await this.usersService.findOneByEmail(email)
    if (!user) {
      this.logger.debug(`User with email ${email} not found. Creating new user...`)
      user = await this.usersService.createOrUpdate({email})
    }

    const code = this.generateCode()
    this.logger.debug(`Sending verification code ${code} to ${user.email}`)
    await this.create(user.id, code)

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

  private generateCode(): number {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000
  }

  private async create(userID: User['id'], code: number): Promise<void> {
    await this.verificationCodeRepository.save({user: {id: userID}, code})
  }
}
