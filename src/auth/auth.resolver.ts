import {UseGuards} from '@nestjs/common'
import {Auth} from './models/auth.model'
import {Mutation, Query, Resolver} from '@nestjs/graphql'
import {AuthService} from './auth.service'
import {SkipJwtAuth} from './decorators/skip-jwt-auth.decorator'
import {CurrentUser} from './decorators/current-user.decorator'
import {JwtRefreshGuard} from './guards/jwt-refresh.guard'
import {User} from '../users/entities/user.entity'

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => Boolean, {description: 'Logout user by deleting refresh token from database'})
  public async logout(@CurrentUser() user: User): Promise<true> {
    await this.authService.logout(user.id)
    return true
  }

  @SkipJwtAuth()
  @UseGuards(JwtRefreshGuard)
  @Mutation(() => Auth, {description: 'Refresh access token and refresh token'})
  public refreshToken(@CurrentUser() user: User): Promise<Auth> {
    return this.authService.refreshTokens(user.id)
  }

  @SkipJwtAuth()
  @Query(() => String, {description: 'Just for testing'})
  public test(): string {
    return 'test'
  }
}
