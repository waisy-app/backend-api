import {Test, TestingModule} from '@nestjs/testing'
import {ProfileService} from './profile.service'
import {getRepositoryToken} from '@nestjs/typeorm'
import {Profile} from './entities/profile.entity'
import {User} from '../users/entities/user.entity'
import {Repository} from 'typeorm'

describe('ProfileService', () => {
  let service: ProfileService
  let repo: Repository<Profile>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(ProfileService)
    repo = module.get(getRepositoryToken(Profile))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create a profile', async () => {
    jest.spyOn(repo, 'create').mockReturnValue({} as any)
    jest.spyOn(repo, 'save').mockResolvedValue({} as any)

    const user: User = {
      id: '1',
      email: 'test@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(await service.createProfile(user, 'title')).toEqual({})
    expect(repo.save).toHaveBeenCalledWith({})
  })

  it('should get profiles by owner', async () => {
    const user = new User()
    const result = [new Profile(), new Profile()]
    jest.spyOn(repo, 'find').mockResolvedValue(result)

    expect(await service.getProfilesByOwner(user)).toEqual(result)
    expect(repo.find).toHaveBeenCalledWith({where: {owner: user}})
  })

  it('should transform to profile model', () => {
    const profile: Profile = {
      id: '1',
      title: 'test',
      owner: {} as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = service.transformToProfileModel(profile)

    expect(result).toStrictEqual({
      id: profile.id,
      title: profile.title,
    })
  })

  it('should transform to profile models', () => {
    const profiles = [
      {
        id: '1',
        title: 'test',
        owner: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'test2',
        owner: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    const result = service.transformToProfileModels(profiles)

    expect(result).toStrictEqual(
      profiles.map(profile => ({
        id: profile.id,
        title: profile.title,
      })),
    )
  })
})
