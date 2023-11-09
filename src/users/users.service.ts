import {Injectable} from '@nestjs/common'
import {User} from './entities/user.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'

type ReturnedUserData = Pick<User, 'email' | 'id'>
const userData = {email: true, id: true}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) readonly usersRepository: Repository<User>) {}

  async createOrUpdate(userInput: Pick<User, 'email'>): Promise<ReturnedUserData> {
    const newUser = this.usersRepository.create(userInput)
    return this.usersRepository.save(newUser, {data: userData})
  }

  async findOneByID(id: User['id']): Promise<User | null> {
    return this.usersRepository.findOneBy({id})
  }

  async findOneByEmail(email: User['email']): Promise<ReturnedUserData | null> {
    const user = await this.usersRepository.findOneBy({email})
    return user ? {email: user.email, id: user.id} : null
  }

  async updateRefreshToken(id: User['id'], refreshToken: User['refreshToken']): Promise<void> {
    await this.usersRepository.update(id, {refreshToken})
  }
}
