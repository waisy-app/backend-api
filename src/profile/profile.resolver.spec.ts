import {Test, TestingModule} from '@nestjs/testing'
import {ProfileResolver} from './profile.resolver'
import {User} from 'src/users/entities/user.entity'
import {ProfileService} from './profile.service'

describe('ProfileResolver', () => {
  let resolver: ProfileResolver
  let service: ProfileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileResolver,
        {
          provide: ProfileService,
          useValue: {
            getProfilesByOwner: jest.fn(),
            createProfile: jest.fn(),
            transformToProfileModel: jest.fn(),
            transformToProfileModels: jest.fn(),
          },
        },
      ],
    }).compile()

    resolver = module.get(ProfileResolver)
    service = module.get(ProfileService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('createProfile', () => {
    it('should throw an error if the user has reached the limit of profiles', async () => {
      jest.spyOn(service, 'getProfilesByOwner').mockResolvedValue([{}, {}] as any)

      await expect(resolver.createProfile({} as User, {title: 'Test'})).rejects.toThrow(
        'You have reached the limit of profiles',
      )
    })

    it('should create a new profile if the user has not reached the limit of profiles', async () => {
      jest.spyOn(service, 'createProfile').mockResolvedValue({} as any)
      jest.spyOn(service, 'transformToProfileModel').mockReturnValue({} as any)
      jest.spyOn(service, 'getProfilesByOwner').mockReturnValue([] as any)

      await expect(resolver.createProfile({} as User, {title: 'Test'})).resolves.toBeDefined()
      expect(service.createProfile).toHaveBeenCalledWith({}, 'Test')
    })
  })

  describe('getProfiles', () => {
    it('should return the profiles of the user', async () => {
      const profiles = [{}, {}]
      jest.spyOn(service, 'getProfilesByOwner').mockResolvedValue(profiles as any)
      jest.spyOn(service, 'transformToProfileModels').mockReturnValue(profiles as any)

      const result = await resolver.getProfiles({} as User)
      expect(result).toEqual(profiles)
      expect(service.getProfilesByOwner).toHaveBeenCalledWith({})
    })
  })
})
