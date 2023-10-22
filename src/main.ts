import {NestFactory, PartialGraphHost} from '@nestjs/core'
import {AppModule} from './app.module'
import {writeFileSync} from 'fs'
import {NestExpressApplication} from '@nestjs/platform-express'
import {ServerConfigService} from './config/server/server.config.service'
import {NODE_ENV} from './config/environment/environment.config.constants'

async function bootstrap() {
  console.time('Nest')
  console.log('Start')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    abortOnError: false,
  })
  const serverConfigService = app.get(ServerConfigService)
  console.log('Listening on port', serverConfigService.port)
  console.log(process.env[NODE_ENV.name])
  await app.listen(serverConfigService.port)
  console.timeEnd('Nest')
}
void bootstrap().catch(() => {
  writeFileSync('error-graph.json', PartialGraphHost.toString() ?? '')
  process.exit(1)
})
