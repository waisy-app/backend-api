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
    return this.createUserByEmail(email)
  }

  public getUserById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({where: {id}})
  }

  public getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({where: {email}})
  }

  private async createUserByEmail(email: string): Promise<User> {
    const newUser = this.usersRepository.create({email})
    return this.usersRepository.save(newUser)
  }
}
