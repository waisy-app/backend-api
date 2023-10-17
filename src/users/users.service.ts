import {Injectable} from '@nestjs/common'
import {CreateUserDto} from './dto/create-user.dto'
import {UpdateUserDto} from './dto/update-user.dto'
import {User} from './entities/user.entity'

@Injectable()
export class UsersService {
  public readonly users: User[] = []

  create(createUserDto: CreateUserDto) {
    this.users.push(createUserDto)
    return {id: this.users.length - 1, ...createUserDto}
  }

  findAll() {
    return this.users.map((user, id) => ({id, ...user}))
  }

  findOne(id: number) {
    return {id, ...this.users[id]}
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    this.users[id] = {...this.users[id], ...updateUserDto}
    return {id, ...this.users[id]}
  }

  remove(id: number) {
    this.users.splice(id, 1)
    return {id}
  }
}
