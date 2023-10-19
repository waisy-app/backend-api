import {TEST} from './environment.config.constants'

export default () => ({
  [TEST.name]: TEST.defaultValue,
})
