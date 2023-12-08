import {NestFactory, PartialGraphHost} from '@nestjs/core'
import {AppModule} from './app.module'
import {writeFileSync} from 'fs'
import {NestExpressApplication} from '@nestjs/platform-express'
import {ServerConfigService} from './config/server/server.config.service'
import {WinstonModule} from 'nest-winston'
import {loggerInstance} from './logger/logger.instance'
import {EnvironmentConfigService} from './config/environment/environment.config.service'

async function bootstrap(): Promise<void> {
  const app = await createApplication()
  const serverConfigService = app.get(ServerConfigService)
  await app.listen(serverConfigService.port)
}

function createApplication(): Promise<NestExpressApplication> {
  return NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: EnvironmentConfigService.isDevelopment,
    abortOnError: !EnvironmentConfigService.isDevelopment,
    logger: WinstonModule.createLogger({instance: loggerInstance}),
  })
}

function handleBootstrapError(error: Error): void {
  loggerInstance.error({message: error.message, stack: error.stack})
  if (EnvironmentConfigService.isDevelopment) {
    writeFileSync('error-graph.json', PartialGraphHost.toString() ?? '')
  }
  process.exit(1)
}

void bootstrap().catch(handleBootstrapError)
