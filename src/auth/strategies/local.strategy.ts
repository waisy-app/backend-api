import {Strategy} from 'passport-local'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common'
import {LOCAL_STRATEGY_NAME} from './strategies.constants'
import {ICurrentUser} from '../decorators/current-user.decorator'
import {validate} from 'class-validator'
import {ValidationException} from '../../exceptions/validation.exception'
import {LoginArgs} from '../dto/login.args'
import {VerificationCodesService} from '../../verification-codes/verification-codes.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_STRATEGY_NAME) {
  private readonly logger = new Logger(LocalStrategy.name)

  constructor(private readonly verificationCodesService: VerificationCodesService) {
    super({usernameField: 'email', passwordField: 'code'})
  }

  // TODO: сделать ограничения по количеству попыток ввода кода подтверждения
  public async validate(email: string, code: number): Promise<ICurrentUser> {
    this.logger.debug(`Validating user with email ${email} and code ${code}`)
    await this.validateLoginArgs(email, code)

    const verificationCode = await this.verificationCodesService.findOne({email}, code)
    const currentDate = new Date()
    // TODO: move this to config. Verification code is valid for 15 minutes
    const validCreatedDate = new Date(currentDate.getTime() - 15 * 60 * 1000)
    if (!verificationCode || verificationCode.createdAt < validCreatedDate) {
      throw new UnauthorizedException('Wrong email or confirmation code')
    }
    await this.verificationCodesService.deleteByID(verificationCode.id)
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
