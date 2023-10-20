import {NestFactory, PartialGraphHost} from '@nestjs/core'
import {AppModule} from './app.module'
import {writeFileSync} from 'fs'
import {NestExpressApplication} from '@nestjs/platform-express'
import {ServerConfigService} from './config/server/server.config.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    abortOnError: false,
  })
  const serverConfigService = app.get(ServerConfigService)
  await app.listen(serverConfigService.port)
}
void bootstrap().catch(() => {
  writeFileSync('error-graph.json', PartialGraphHost.toString() ?? '')
  process.exit(1)
})
