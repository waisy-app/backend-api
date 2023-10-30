import {Args, ComplexityEstimatorArgs, Int, Mutation, Query, Resolver} from '@nestjs/graphql'
import {UsersService} from './users.service'
import {User} from './models/user.model'
import {CreateUserInput} from './dto/create-user.input'
import {UpdateUserInput} from './dto/update-user.input'
import {SkipJwtAuth} from '../auth/decorators/skip-jwt-auth.decorator'
import {CurrentUser} from '../auth/decorators/current-user.decorator'
import {Logger} from '@nestjs/common'

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name)

  constructor(private usersService: UsersService) {}

  @SkipJwtAuth()
  @Query(() => User, {name: 'user', nullable: true})
  async getUser(@Args('id', {type: () => Int}) id: number) {
    return this.usersService.findOneByID(id)
  }

  @Query(() => [User], {
    name: 'users',
    complexity: (options: ComplexityEstimatorArgs) => options.args.count * options.childComplexity,
  })
  async getUsers(@Args('count', {type: () => Int}) count: number, @CurrentUser() user: User) {
    this.logger.debug({
      message: 'Current user',
      user,
    })
    this.logger.debug(`Count: ${count}`)
    return this.usersService.findAll()
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return await this.usersService.create(createUserInput)
  }

  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput)
  }

  @Mutation(() => Int)
  async removeUser(@Args('id', {type: () => Int}) id: number) {
    return this.usersService.remove(id)
  }
}