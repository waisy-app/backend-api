import {Controller, Get} from '@nestjs/common'
import {AppService} from './app.service'
import {SkipAuth} from './auth/decorators/skip-auth.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipAuth()
  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello()
  }
}
