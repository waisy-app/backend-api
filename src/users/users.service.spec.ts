import {User} from './entities/user.entity'
import {UsersService} from './users.service'
import {Repository} from 'typeorm'
import {Test, TestingModule} from '@nestjs/testing'
import {getRepositoryToken} from '@nestjs/typeorm'

describe('UsersService', () => {
  let service: UsersService
  let repo: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repo = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should create a user by email', async () => {
    const testUser = new User()
    testUser.email = 'test@example.com'

    jest.spyOn(repo, 'create').mockReturnValueOnce(testUser)
    jest.spyOn(repo, 'save').mockResolvedValueOnce(testUser)
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

    expect(await service.getOrCreateUserByEmail('test@example.com')).toEqual(testUser)
  })

  it('should not create a user by email if it already exists', async () => {
    const testUser = new User()
    testUser.email = 'test@example.com'
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser)
    jest.spyOn(repo, 'create')
    jest.spyOn(repo, 'save')
    expect(await service.getOrCreateUserByEmail(testUser.email)).toEqual(testUser)
    expect(repo.create).not.toHaveBeenCalled()
    expect(repo.save).not.toHaveBeenCalled()
  })

  it('should get a user by id', async () => {
    const testUser = new User()
    testUser.id = '1'

    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser)

    expect(await service.getUserById('1')).toEqual(testUser)
  })

  it('should get a user by email', async () => {
    const testUser = new User()
    testUser.email = 'test@example.com'

    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser)

    expect(await service.getUserByEmail('test@example.com')).toEqual(testUser)
  })
})
