import {NestFactory, PartialGraphHost} from '@nestjs/core'
import {AppModule} from './app.module'
import {writeFileSync} from 'fs'
import {NestExpressApplication} from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    abortOnError: false,
  })
  await app.listen(3000)
}
void bootstrap().catch(() => {
  writeFileSync('graph.json', PartialGraphHost.toString() ?? '')
  process.exit(1)
})
