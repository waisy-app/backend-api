import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {SkipJwtAccessTokenGuard} from './decorators/skip-jwt-access-token-guard.decorator'
import {UseGuards} from '@nestjs/common'
import {JwtRefreshTokenGuard} from './guards/jwt-refresh-token.guard'
import {CurrentUser} from './decorators/current-user.decorator'
import {User} from '../users/entities/user.entity'
import {RefreshTokenService} from './refresh-token.service'
import {Tokens} from './models/tokens.model'
import {DeviceInfoArgs} from './dto/device-info.args'

@Resolver()
export class RefreshTokenResolver {
  constructor(private readonly tokenService: RefreshTokenService) {}

  @SkipJwtAccessTokenGuard()
  @UseGuards(JwtRefreshTokenGuard)
  @Mutation(() => Tokens, {description: 'Refresh access token and refresh token'})
  public async refreshAccessToken(
    @CurrentUser() user: User,
    @Args() {deviceInfo}: DeviceInfoArgs,
  ): Promise<Tokens> {
    await this.tokenService.deactivateTokenByUserAndDeviceInfo(user, deviceInfo)
    return this.tokenService.generateAndSaveTokens(user, deviceInfo)
  }

  @Mutation(() => Boolean, {
    description: 'Logout user by deactivating refresh token for device',
  })
  public async deactivateRefreshToken(
    @CurrentUser() user: User,
    @Args() {deviceInfo}: DeviceInfoArgs,
  ): Promise<true> {
    await this.tokenService.deactivateTokenByUserAndDeviceInfo(user, deviceInfo)
    return true
  }

  @Mutation(() => Boolean, {
    description: 'Logout user by deactivating all refresh tokens',
  })
  public async deactivateAllRefreshTokens(@CurrentUser() user: User): Promise<true> {
    await this.tokenService.deactivateTokensByUser(user)
    return true
  }

  @SkipJwtAccessTokenGuard()
  @Query(() => String, {description: 'Just for testing'})
  public test(): string {
    return 'test'
  }
}
