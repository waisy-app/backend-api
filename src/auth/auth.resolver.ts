import {UseGuards} from '@nestjs/common'
import {Auth} from './models/auth.model'
import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {AuthService} from './auth.service'
import {EmailAuthGuard} from './guards/email-auth.guard'
import {SkipJwtAuth} from './decorators/skip-jwt-auth.decorator'
import {CurrentUser, ICurrentUser} from './decorators/current-user.decorator'
import {JwtRefreshGuard} from './guards/jwt-refresh.guard'
import {LoginArgs} from './dto/login.args'

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @SkipJwtAuth()
  @UseGuards(EmailAuthGuard)
  @Mutation(() => Auth, {
    description: `Get access token and refresh token. 
    Find and login already existing user or create new user if email is not registered`,
  })
  public login(@Args() input: LoginArgs, @CurrentUser() user: ICurrentUser): Promise<Auth> {
    return this.authService.login(user.id)
  }

  @Mutation(() => Boolean, {description: 'Logout user by deleting refresh token from database'})
  public async logout(@CurrentUser() user: ICurrentUser): Promise<true> {
    await this.authService.logout(user.id)
    return true
  }

  @SkipJwtAuth()
  @UseGuards(JwtRefreshGuard)
  @Mutation(() => Auth, {description: 'Refresh access token and refresh token'})
  public refreshToken(@CurrentUser() user: ICurrentUser): Promise<Auth> {
    return this.authService.refreshTokens(user.id)
  }

  @SkipJwtAuth()
  @Query(() => String, {description: 'Just for testing'})
  public test(): string {
    return 'test'
  }
}
