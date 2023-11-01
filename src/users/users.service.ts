import {Injectable} from '@nestjs/common'
import {User} from './entities/user.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'

type ICreateUserInput = Pick<User, 'email' | 'password'>

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) readonly usersRepository: Repository<User>) {}

  async createOrUpdate(userInput: ICreateUserInput): Promise<User> {
    const newUser = this.usersRepository.create(userInput)
    return this.usersRepository.save(newUser, {data: {password: true, email: true, id: true}})
  }

  async findOneByID(id: User['id']): Promise<User | null> {
    return this.usersRepository.findOneBy({id})
  }

  async findOneByEmail(email: User['email']): Promise<User | null> {
    return this.usersRepository.findOneBy({email})
  }

  async updateRefreshToken(id: User['id'], refreshToken: User['refreshToken']): Promise<void> {
    await this.usersRepository.update(id, {refreshToken})
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.delete(id)
  }
}
