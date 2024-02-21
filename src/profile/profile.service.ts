import {Injectable} from '@nestjs/common'
import {Profile as ProfileModel} from './models/profile.model'
import {Profile} from './entities/profile.entity'
import {User} from 'src/users/entities/user.entity'
import {Repository} from 'typeorm'
import {InjectRepository} from '@nestjs/typeorm'

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  public async createProfile(owner: User, title: string): Promise<Profile> {
    const newProfile = this.profileRepository.create({owner, title})
    return this.profileRepository.save(newProfile)
  }

  public async getProfilesByOwner(owner: User): Promise<Profile[]> {
    return this.profileRepository.find({where: {owner: {id: owner.id}}})
  }

  public transformToProfileModel(profile: Profile): ProfileModel {
    return {
      id: profile.id,
      title: profile.title,
    }
  }

  public transformToProfileModels(profiles: Profile[]): ProfileModel[] {
    return profiles.map(profile => this.transformToProfileModel(profile))
  }
}
