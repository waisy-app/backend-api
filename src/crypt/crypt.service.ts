import {Injectable} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import {AuthConfigService} from '../config/auth/auth.config.service'

@Injectable()
export class CryptService {
  private readonly hashRounds: number = AuthConfigService.hashRounds

  public hashText(text: string): Promise<string> {
    return bcrypt.hash(text, this.hashRounds)
  }

  public compareHash(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash)
  }
}
