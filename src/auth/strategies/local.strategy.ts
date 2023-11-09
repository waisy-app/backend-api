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
  async validate(email: string, code: number): Promise<ICurrentUser> {
    this.logger.debug(`Validating user with email ${email} and code ${code}`)
    await this.validateLoginArgs(email, code)

    const mailConfirmation = await this.verificationCodesService.findOne({email}, code)
    if (!mailConfirmation) throw new UnauthorizedException('Wrong email or confirmation code')
    await this.verificationCodesService.deleteByID(mailConfirmation.id)
    return {id: mailConfirmation.user.id, email: mailConfirmation.user.email}
  }

  private async validateLoginArgs(email: string, code: number): Promise<void> {
    const input = new LoginArgs()
    input.email = email
    input.confirmationCode = code
    const validation = await validate(input)
    if (validation.length) throw new ValidationException(validation)
  }
}
