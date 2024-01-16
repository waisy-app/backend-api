import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {SkipJwtAccessTokenGuard} from './decorators/skip-jwt-access-token-guard.decorator'
import {UseGuards} from '@nestjs/common'
import {JwtRefreshTokenGuard} from './guards/jwt-refresh-token.guard'
import {CurrentUser} from './decorators/current-user.decorator'
import {User} from '../users/entities/user.entity'
import {RefreshTokenService} from './refresh-token.service'
import {Tokens} from './models/tokens.model'
import {DeviceInfoArgs} from './dto/device-info.args'
import {resolverDescriptions} from './refresh-token.resolver.descriptions'

@Resolver()
export class RefreshTokenResolver {
  constructor(private readonly tokenService: RefreshTokenService) {}

  @SkipJwtAccessTokenGuard()
  @UseGuards(JwtRefreshTokenGuard)
  @Mutation(() => Tokens, {description: resolverDescriptions.refreshTokens})
  public async refreshTokens(
    @CurrentUser() user: User,
    @Args() {deviceInfo}: DeviceInfoArgs,
  ): Promise<Tokens> {
    await this.tokenService.deactivateTokenByUserAndDeviceInfo(user, deviceInfo)
    return this.tokenService.generateAndSaveTokens(user, deviceInfo)
  }

  @Mutation(() => Boolean, {description: resolverDescriptions.deactivateRefreshToken})
  public async deactivateRefreshToken(
    @CurrentUser() user: User,
    @Args() {deviceInfo}: DeviceInfoArgs,
  ): Promise<true> {
    await this.tokenService.deactivateTokenByUserAndDeviceInfo(user, deviceInfo)
    return true
  }

  @Mutation(() => Boolean, {description: resolverDescriptions.deactivateAllRefreshTokens})
  public async deactivateAllRefreshTokens(@CurrentUser() user: User): Promise<true> {
    await this.tokenService.deactivateTokensByUser(user)
    return true
  }

  @Query(() => [String], {description: resolverDescriptions.getActiveDevices})
  public async getActiveDevices(@CurrentUser() user: User): Promise<string[]> {
    return this.tokenService.getActiveDevicesByUser(user)
  }
}
