import {format, transports} from 'winston'
import {utilities} from 'nest-winston'
import {EnvironmentConfigService as Env} from '../../config/environment/environment.config.service'

export const localDevTransport = new transports.Console({
  format: format.combine(
    format.timestamp({format: 'DD/MM/YYYY HH:mm:ss.SSS'}),
    utilities.format.nestLike(Env.appName, {
      colors: true,
      prettyPrint: true,
    }),
  ),
})
