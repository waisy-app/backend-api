import {Injectable, Logger} from '@nestjs/common'
import {User} from './entities/user.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(@InjectRepository(User) public readonly usersRepository: Repository<User>) {}

  public createOrUpdate(userInput: Pick<User, 'email'>): Promise<User> {
    this.logger.debug(`Creating or updating user with email "${userInput.email}"`)
    const newUser = this.usersRepository.create(userInput)
    return this.usersRepository.save(newUser)
  }

  public findOneByID(id: User['id']): Promise<User | null> {
    return this.usersRepository.findOneBy({id})
  }

  public findOneByEmail(email: User['email']): Promise<User | null> {
    return this.usersRepository.findOneBy({email})
  }

  public async activate(id: User['id']): Promise<void> {
    await this.usersRepository.update(id, {isActivated: true})
  }

  public async updateRefreshToken(
    id: User['id'],
    refreshToken: User['refreshToken'],
  ): Promise<void> {
    await this.usersRepository.update(id, {refreshToken})
  }
}
