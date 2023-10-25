import {Controller, Get} from '@nestjs/common'
import {AppService} from './app.service'
import {SkipJwtAuth} from './auth/decorators/skip-jwt-auth.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipJwtAuth()
  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello()
  }
}
