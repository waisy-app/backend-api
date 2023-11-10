import {Injectable} from '@nestjs/common'
import {LoginAttempt} from './entities/login-attempt.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {MoreThan, Repository} from 'typeorm'
import {User} from '../users/entities/user.entity'

@Injectable()
export class LoginAttemptsService {
  constructor(
    @InjectRepository(LoginAttempt)
    public readonly loginAttemptsRepository: Repository<LoginAttempt>,
  ) {}

  public async create(loginAttempt: {
    user?: {id: User['id']} | null
    isSuccessful?: boolean
    ipAddress?: string
  }): Promise<LoginAttempt> {
    const newLoginAttempt = this.loginAttemptsRepository.create(loginAttempt)
    return this.loginAttemptsRepository.save(newLoginAttempt)
  }

  public async findByIpWhereCreatedAtMoreThen(
    date: Date,
    ipAddress: string,
  ): Promise<LoginAttempt[]> {
    return this.loginAttemptsRepository.findBy({
      createdAt: MoreThan(date),
      ipAddress,
    })
  }
}
