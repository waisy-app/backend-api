import {NestFactory, PartialGraphHost} from '@nestjs/core'
import {AppModule} from './app.module'
import {writeFileSync} from 'fs'
import {NestExpressApplication} from '@nestjs/platform-express'
import {ServerConfigService} from './config/server/server.config.service'
import {NODE_ENV} from './config/environment/environment.config.constants'
import {WinstonModule} from 'nest-winston'
import {loggerInstance} from './logger'

const isDev = process.env[NODE_ENV.name] === NODE_ENV.options.DEVELOPMENT

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: isDev,
    abortOnError: !isDev,
    logger: WinstonModule.createLogger({
      instance: loggerInstance,
    }),
  })
  const serverConfigService = app.get(ServerConfigService)
  await app.listen(serverConfigService.port)
}
void bootstrap().catch(error => {
  loggerInstance.error({message: error.message, stack: error.stack})
  if (isDev) writeFileSync('error-graph.json', PartialGraphHost.toString() ?? '')
  process.exit(1)
})
