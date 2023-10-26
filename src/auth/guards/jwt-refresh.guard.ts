import {JWT_REFRESH_STRATEGY_NAME} from '../strategies/strategies.constants'
import {AuthGuard} from '@nestjs/passport'
import {Injectable} from '@nestjs/common'

@Injectable()
export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH_STRATEGY_NAME) {}
