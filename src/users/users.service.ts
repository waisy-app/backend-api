import {Injectable, NotFoundException} from '@nestjs/common'
import {CreateUserDto} from './dto/create-user.dto'
import {UpdateUserDto} from './dto/update-user.dto'
import {User} from './entities/user.entity'

@Injectable()
export class UsersService {
  public readonly users: User[] = []
  public lastID: number = 0

  create(createUserDto: CreateUserDto): User {
    const id = ++this.lastID
    const user = {...createUserDto, id}
    this.users.push(user)
    return user
  }

  findAll(): User[] {
    return this.users
  }

  findOne(id: number): User {
    const user = this.users.find(user => user.id === id)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.users.find(user => user.id === id)
    if (!user) throw new NotFoundException('User not found')
    const newUser = {...user, ...updateUserDto}
    this.users.splice(this.users.indexOf(user), 1, newUser)
    return newUser
  }

  remove(id: number): void {
    const user = this.users.find(user => user.id === id)
    if (!user) throw new NotFoundException('User not found')
    this.users.splice(this.users.indexOf(user), 1)
  }
}
