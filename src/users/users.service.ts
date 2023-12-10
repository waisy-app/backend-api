import {Injectable} from '@nestjs/common'
import {User} from './entities/user.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) public readonly usersRepository: Repository<User>) {}

  public async getOrCreateUserByEmail(email: string): Promise<User> {
    const newUser = this.usersRepository.create({email})
    return this.usersRepository.save(newUser)
  }

  public getUserById(id: string): Promise<User | null> {
    return this.getUser('id', id)
  }

  public getUserByEmail(email: string): Promise<User | null> {
    return this.getUser('email', email)
  }

  public async activateUserById(id: string): Promise<void> {
    await this.updateUserById(id, {status: 'active'})
  }

  public async updateUserRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.updateUserById(id, {refreshToken})
  }

  private updateUserById(id: string, data: Partial<User>): Promise<void> {
    return this.updateUser('id', id, data)
  }

  private async updateUser(field: keyof User, value: unknown, data: Partial<User>): Promise<void> {
    await this.usersRepository.update({[field]: value}, data)
  }

  private getUser(field: keyof User, value: unknown): Promise<User | null> {
    return this.usersRepository.findOne({[field]: value})
  }
}
