import {Injectable} from '@nestjs/common'
import {User} from './entities/user.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) public readonly usersRepository: Repository<User>) {}

  public async getOrCreateUserByEmail(email: string): Promise<User> {
    const user = await this.getUserByEmail(email)
    if (user) return user
    return this.createUser({email})
  }

  public getUserById(id: string): Promise<User | null> {
    return this.getUser('id', id)
  }

  public getUserByEmail(email: string): Promise<User | null> {
    return this.getUser('email', email)
  }

  public async activateUserById(id: string): Promise<void> {
    await this.updateUser('id', id, {status: 'active'})
  }

  private async createUser(data: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(data)
    return this.usersRepository.save(newUser)
  }

  private async updateUser(
    field: keyof User,
    value: User[keyof User],
    data: Partial<User>,
  ): Promise<void> {
    await this.usersRepository.update({[field]: value}, data)
  }

  private getUser(field: keyof User, value: User[keyof User]): Promise<User | null> {
    return this.usersRepository.findOne({where: {[field]: value}})
  }
}
