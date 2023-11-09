import {Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {User} from '../users/entities/user.entity'
import {Repository} from 'typeorm'
import {MailConfirmation} from './entities/mail-confirmation.entity'
import {UsersService} from '../users/users.service'

@Injectable()
export class MailConfirmationService {
  private readonly logger: Logger = new Logger(MailConfirmationService.name)

  constructor(
    @InjectRepository(MailConfirmation)
    readonly mailConfirmationsRepository: Repository<MailConfirmation>,
    private readonly usersService: UsersService,
  ) {}

  // TODO: сделать ограничения по количеству отправок кода подтверждения на почту
  // TODO: изменить алгоритм регистрации. Во время подтверждения пользователь не создается,
  //  а создается только после подтверждения почты (на этапе auth/login)
  async sendConfirmationCode(email: User['email']): Promise<void> {
    let user = await this.usersService.findOneByEmail(email)
    if (!user) {
      this.logger.debug(`User with email ${email} not found. Creating new user...`)
      user = await this.usersService.createOrUpdate({email})
    }

    const code = this.generateCode()
    this.logger.debug(`Sending confirmation code ${code} to ${user.email}`)
    await this.create(user.id, code)

    // TODO: отправка кода подтверждения на почту
  }

  async findOne(
    user: {id: User['id']} | {email: User['email']},
    code: number,
  ): Promise<MailConfirmation | null> {
    return this.mailConfirmationsRepository.findOne({
      where: {user, code},
      relations: ['user'],
    })
  }

  async deleteByID(id: MailConfirmation['id']): Promise<void> {
    await this.mailConfirmationsRepository.delete({id})
  }

  private generateCode(): number {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000
  }

  private async create(userID: User['id'], code: number): Promise<void> {
    await this.mailConfirmationsRepository.save({user: {id: userID}, code})
  }
}
