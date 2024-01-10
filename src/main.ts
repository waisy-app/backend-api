import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {NestExpressApplication} from '@nestjs/platform-express'
import {ServerConfigService} from './config/server/server.config.service'
import {WinstonModule} from 'nest-winston'
import {buildLoggerInstance} from './logger'
import {LoggerConfigService} from './config/logger/logger.config.service'

async function bootstrap(): Promise<void> {
  const app = await createApplication()
  const loggerConfigService = app.get(LoggerConfigService)
  const loggerInstance = buildLoggerInstance(loggerConfigService.loggerLevel)
  app.useLogger(WinstonModule.createLogger({instance: loggerInstance}))
  const serverConfigService = app.get(ServerConfigService)
  await app.listen(serverConfigService.port)
}

function createApplication(): Promise<NestExpressApplication> {
  return NestFactory.create<NestExpressApplication>(AppModule, {bufferLogs: true})
}

function handleBootstrapError(error: Error): void {
  const loggerInstance = buildLoggerInstance('error')
  loggerInstance.error({message: error.message, stack: error.stack})
  process.exit(1)
}

bootstrap().catch(handleBootstrapError)
