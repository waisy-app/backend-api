import {Injectable} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import {AuthConfigService} from '../config/auth/auth.config.service'

@Injectable()
export class CryptService {
  constructor(private readonly authConfigService: AuthConfigService) {}

  hashText(text: string): Promise<string> {
    return bcrypt.hash(text, this.authConfigService.hashRounds)
  }

  compareHash(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash)
  }
}
