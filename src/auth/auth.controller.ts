import {Body, Controller, Get, HttpCode, HttpStatus, Post, Request} from '@nestjs/common'
import {AuthService} from './auth.service'
import {SignInDto} from './dto/sign-in.dto'
import {AuthUser} from './entities/auth-user.entity'
import {SkipAuth} from './decorators/skip-auth.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password)
  }

  @Get('profile')
  getProfile(@Request() request: Request & {user: AuthUser}) {
    return request.user
  }
}
