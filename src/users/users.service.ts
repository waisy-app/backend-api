import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common'
import {User} from './entities/user.entity'
import {CreateUserInput} from './dto/create-user.input'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {UpdateUserInput} from './dto/update-user.input'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const user = await this.findOneByEmail(createUserInput.email)
    if (user) {
      throw new BadRequestException(`User with email ${createUserInput.email} already exists`)
    }
    const newUser = this.usersRepository.create(createUserInput)
    return this.usersRepository.save(newUser)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async findOneByID(id: User['id']): Promise<User | null> {
    return this.usersRepository.findOneBy({id})
  }

  async update(updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.usersRepository.findOneBy({id: updateUserInput.id})
    if (!user) throw new NotFoundException(`User not found`)
    await this.usersRepository.update(updateUserInput.id, updateUserInput)
    return {...user, ...updateUserInput}
  }

  async remove(id: User['id']): Promise<User['id']> {
    await this.usersRepository.delete(id)
    return id
  }

  async findOneByEmail(email: User['email']): Promise<User | null> {
    return this.usersRepository.findOneBy({email})
  }
}
