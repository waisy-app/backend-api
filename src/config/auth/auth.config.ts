import {HASH_ROUNDS, MAX_SENDING_VERIFICATION_CODE_ATTEMPTS} from './auth.config.constants'
import {NODE_ENV} from '../environment/environment.config.constants'

const isTest = process.env[NODE_ENV.name] === NODE_ENV.options.TEST

export default (): Record<string, unknown> => ({
  [HASH_ROUNDS.name]: isTest ? 1 : HASH_ROUNDS.defaultValue,
  [MAX_SENDING_VERIFICATION_CODE_ATTEMPTS.name]:
    MAX_SENDING_VERIFICATION_CODE_ATTEMPTS.defaultValue,
})
