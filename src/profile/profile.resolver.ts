import {Args, Mutation, Query, Resolver} from '@nestjs/graphql'
import {Profile} from './models/profile.model'
import {ProfileService} from './profile.service'
import {CurrentUser} from 'src/refresh-token/decorators/current-user.decorator'
import {User} from 'src/users/entities/user.entity'
import {CreateProfileArgs} from './dto/create-profile.args'
import {resolverDescriptions} from './profile.resolver.descriptions'
import {ForbiddenError} from 'src/errors/general-errors/forbidden.error'

const MAX_PROFILES = 1

@Resolver()
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Mutation(() => Profile, {description: resolverDescriptions.createProfile})
  public async createProfile(
    @CurrentUser() user: User,
    @Args() {title}: CreateProfileArgs,
  ): Promise<Profile> {
    const profiles = await this.profileService.getProfilesByOwner(user)
    if (profiles.length >= MAX_PROFILES) {
      throw new ForbiddenError('You have reached the limit of profiles')
    }

    const newProfile = await this.profileService.createProfile(user, title)
    return this.profileService.transformToProfileModel(newProfile)
  }

  @Query(() => [Profile], {description: resolverDescriptions.getProfiles})
  public async getProfiles(@CurrentUser() user: User): Promise<Profile[]> {
    const profiles = await this.profileService.getProfilesByOwner(user)
    return this.profileService.transformToProfileModels(profiles)
  }
}
