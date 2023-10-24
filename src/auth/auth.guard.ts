import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import {Request} from 'express'
import {AuthConfigService} from '../config/auth/auth.config.service'
import {AuthUser} from './entities/auth-user.entity'
import {Reflector} from '@nestjs/core'
import {IS_PUBLIC_KEY} from './decorators/skip-auth.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authConfigService: AuthConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request & {user?: AuthUser}>()
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException('Missing access token')

    try {
      request.user = this.jwtService.verify(token, {
        secret: this.authConfigService.jwtSecretToken,
      }) as AuthUser
    } catch {
      throw new UnauthorizedException('Invalid access token')
    }
    return true
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
