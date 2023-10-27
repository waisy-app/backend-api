import {NODE_ENV} from '../environment/environment.config.constants'
import {REQUEST_TIMEOUT_MS} from './server.config.constants'

const isTest = process.env[NODE_ENV.name] === NODE_ENV.options.TEST

export default () => ({
  [REQUEST_TIMEOUT_MS.name]: isTest ? 20 : REQUEST_TIMEOUT_MS.defaultValue,
})
