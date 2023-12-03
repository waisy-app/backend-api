import {
  HASH_ROUNDS,
  MAX_SENDING_VERIFICATION_CODE_ATTEMPTS,
  VERIFICATION_CODE_LIFETIME_SECONDS,
} from './auth.config.constants'
import {EnvironmentConfigService} from '../environment/environment.config.service'

export default (): Record<string, unknown> => ({
  [HASH_ROUNDS.name]: EnvironmentConfigService.isTest ? 1 : HASH_ROUNDS.defaultValue,
  [MAX_SENDING_VERIFICATION_CODE_ATTEMPTS.name]:
    MAX_SENDING_VERIFICATION_CODE_ATTEMPTS.defaultValue,
  [VERIFICATION_CODE_LIFETIME_SECONDS.name]: VERIFICATION_CODE_LIFETIME_SECONDS.defaultValue,
})
