import {NestFactory, PartialGraphHost} from '@nestjs/core'
import {AppModule} from './app.module'
import {writeFileSync} from 'fs'
import {NestExpressApplication} from '@nestjs/platform-express'
import * as process from 'process'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    abortOnError: false,
  })
  await app.listen(process.env['PORT'] ?? 3000)
}
void bootstrap().catch(() => {
  const isDev = process.env['NODE_ENV'] !== 'production'
  if (isDev) writeFileSync('error-graph.json', PartialGraphHost.toString() ?? '')
  process.exit(1)
})
