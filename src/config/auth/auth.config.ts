import {HASH_ROUNDS} from './auth.config.constants'
import {NODE_ENV} from '../environment/environment.config.constants'

const isTest = process.env[NODE_ENV.name] === NODE_ENV.options.TEST

export default () => ({
  [HASH_ROUNDS.name]: isTest ? 1 : HASH_ROUNDS.defaultValue,
})
