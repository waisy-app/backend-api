import {Injectable} from '@nestjs/common'
import {AuthGuard} from '@nestjs/passport'
import {LOCAL_STRATEGY_NAME} from '../strategies/strategies.constants'

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_STRATEGY_NAME) {}
