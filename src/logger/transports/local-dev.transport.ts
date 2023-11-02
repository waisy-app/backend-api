import {format, transports} from 'winston'
import {utilities} from 'nest-winston'
import {APP_NAME} from '../../config/environment/environment.config.constants'

export const localDevTransport = new transports.Console({
  format: format.combine(
    format.timestamp({format: 'DD/MM/YYYY HH:mm:ss.SSS'}),
    utilities.format.nestLike(process.env[APP_NAME.name] ?? APP_NAME.defaultValue, {
      colors: true,
      prettyPrint: true,
    }),
  ),
})
