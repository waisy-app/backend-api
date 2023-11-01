import {format, transports} from 'winston'

export const jsonConsoleTransport = new transports.Console({format: format.json()})
