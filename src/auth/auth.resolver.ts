import {UseGuards} from '@nestjs/common'
import {Auth} from './models/auth.model'
import {Args, Mutation, Resolver} from '@nestjs/graphql'
import {AuthService} from './auth.service'
import {LocalAuthGuard} from './guards/local-auth.guard'
import {SkipJwtAuth} from './decorators/skip-jwt-auth.decorator'
import {LoginInput} from './dto/login.input'
import {CurrentUser} from './decorators/current-user.decorator'
import {CurrentUserType} from './types/current-user.type'
import {JwtRefreshGuard} from './guards/jwt-refresh.guard'

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @SkipJwtAuth()
  @UseGuards(LocalAuthGuard)
  @Mutation(() => Auth, {
    description: `Get access token and refresh token. 
    Find and login already existing user or create new user if email is not registered`,
  })
  login(@Args('loginInput') loginInput: LoginInput, @CurrentUser() user: CurrentUserType) {
    return this.authService.login(user.id)
  }

  @Mutation(() => Boolean, {description: 'Logout user by deleting refresh token from database'})
  async logout(@CurrentUser() user: CurrentUserType) {
    await this.authService.logout(user.id)
    return true
  }

  @SkipJwtAuth()
  @UseGuards(JwtRefreshGuard)
  @Mutation(() => Auth, {description: 'Refresh access token and refresh token'})
  refreshToken(@CurrentUser() user: CurrentUserType) {
    return this.authService.refreshTokens(user.id)
  }
}