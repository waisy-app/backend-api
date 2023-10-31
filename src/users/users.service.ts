import {Injectable, NotFoundException} from '@nestjs/common'
import {UpdateUserDto} from './dto/update-user.dto'
import {User} from './entities/user.entity'
import {CreateUserInput} from './dto/create-user.input'

@Injectable()
export class UsersService {
  public readonly users: User[] = []
  public lastID: number = 0

  async create(createUserInput: CreateUserInput): Promise<User> {
    const id = ++this.lastID
    const user = {...createUserInput, id}
    this.users.push(user)
    return user
  }

  async findAll(): Promise<User[]> {
    return this.users
  }

  async findOneByID(id: number): Promise<User | null> {
    const user = this.users.find(user => user.id === id)
    return user ?? null
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = this.users.find(user => user.id === id)
    if (!user) throw new NotFoundException('User not found')
    const newUser = {...user, ...updateUserDto}
    this.users.splice(this.users.indexOf(user), 1, newUser)
    return newUser
  }

  async remove(id: number): Promise<number> {
    const user = this.users.find(user => user.id === id)
    if (!user) throw new NotFoundException('User not found')
    this.users.splice(this.users.indexOf(user), 1)
    return user.id
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = this.users.find(user => user.email === email)
    return user ?? null
  }
}
