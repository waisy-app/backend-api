import {Strategy} from 'passport-local'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {LOCAL_STRATEGY_NAME} from './strategies.constants'
import {ICurrentUser} from '../decorators/current-user.decorator'
import {UsersService} from '../../users/users.service'
import {validate} from 'class-validator'
import {LoginInput} from '../dto/login.input'
import {ValidationException} from '../../exceptions/validation.exception'
import {CryptService} from '../../crypt/crypt.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_STRATEGY_NAME) {
  private readonly logger = new Logger(LocalStrategy.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly cryptService: CryptService,
  ) {
    super({usernameField: 'email', passwordField: 'password'})
  }

  async validate(email: string, password: string): Promise<ICurrentUser> {
    const user = await this.validateUser(email, password)
    if (!user) throw new UnauthorizedException('Wrong email or password')
    return user
  }

  private async validateUser(email: string, password: string): Promise<ICurrentUser | null> {
    const user = await this.usersService.findOneByEmail(email)

    if (!user) return this.validateNewUser(email, password)
    if (!user.password) return null

    const isPasswordMatch = await this.cryptService.compareHash(password, user.password)
    return isPasswordMatch ? {id: user.id, email: user.email} : null
  }

  private async validateNewUser(email: string, password: string): Promise<ICurrentUser | null> {
    const input = new LoginInput()
    input.email = email
    input.password = password

    const validation = await validate(input)
    if (validation.length) throw new ValidationException(validation)

    this.logger.debug(`User with email ${input.email} not found. Creating new user...`)
    const hashedPassword = await this.cryptService.hashText(input.password)
    const newUser = await this.usersService.create({email: input.email, password: hashedPassword})
    return {id: newUser.id, email: newUser.email}
  }
}
