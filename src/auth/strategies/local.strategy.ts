import {Strategy} from 'passport-local'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {EMAIL_CODE_STRATEGY_NAME} from './strategies.constants'
import {ICurrentUser} from '../decorators/current-user.decorator'
import {validate} from 'class-validator'
import {ValidationException} from '../../exceptions/validation.exception'
import {LoginArgs} from '../dto/login.args'
import {VerificationCodesService} from '../../verification-codes/verification-codes.service'
import {LoginAttemptsService} from '../../login-attempts/login-attempts.service'
import {Request} from 'express'
import * as requestIp from 'request-ip'
import {UsersService} from '../../users/users.service'
// TODO: refactor this
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, EMAIL_CODE_STRATEGY_NAME) {
  private readonly logger = new Logger(LocalStrategy.name)

  constructor(
    private readonly verificationCodesService: VerificationCodesService,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly usersService: UsersService,
  ) {
    super({usernameField: 'email', passwordField: 'code', passReqToCallback: true})
  }

  public async validate(req: Request, email: string, code: number): Promise<ICurrentUser> {
    this.logger.debug(`Validating user with email ${email} and code ${code}`)

    const clientIp = requestIp.getClientIp(req)
    if (!clientIp) throw new UnauthorizedException('Cannot get client IP address')

    await this.validateLoginArgs(email, code)

    const user = await this.usersService.findOneByEmail(email)

    const currentDate = new Date()
    // TODO: вынести логику loginAttempts в отдельный мидлвар (interceptor)
    // TODO: вынести в конфиг. Пользователь может ввести код подтверждения не более 3 раз в 10 минут
    const loginAttempts = await this.loginAttemptsService.findByIpWhereCreatedAtMoreThen(
      new Date(currentDate.getTime() - 10 * 60 * 1000),
      clientIp,
    )
    if (loginAttempts.length >= 3) {
      await this.loginAttemptsService.create({
        ipAddress: clientIp,
        user,
        isSuccessful: false,
      })
      throw new UnauthorizedException('Too many login attempts')
    }

    const verificationCode = await this.verificationCodesService.findOneByUserAndCode({email}, code)
    // TODO: use expiration date from verificationCode
    const validCreatedDate = new Date(currentDate.getTime() - 10 * 60 * 1000)
    if (!verificationCode || verificationCode.createdAt < validCreatedDate) {
      await this.loginAttemptsService.create({
        ipAddress: clientIp,
        user,
        isSuccessful: false,
      })
      throw new UnauthorizedException('Wrong email or verification code')
    }
    await this.verificationCodesService.setStatusByID(verificationCode.id, 'used')
    await this.loginAttemptsService.create({
      user: verificationCode.user,
      ipAddress: clientIp,
      isSuccessful: true,
    })
    if (verificationCode.user.status !== 'active') {
      await this.usersService.activate(verificationCode.user.id)
    }

    return {id: verificationCode.user.id, email: verificationCode.user.email}
  }

  private async validateLoginArgs(email: string, code: number): Promise<void> {
    const input = new LoginArgs()
    input.email = email
    input.confirmationCode = code
    const validation = await validate(input)
    if (validation.length) throw new ValidationException(validation)
  }
}
