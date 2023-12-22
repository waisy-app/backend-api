import {Injectable} from '@nestjs/common'
import * as argon2 from 'argon2'

@Injectable()
export class CryptService {
  public hashText(text: string): Promise<string> {
    return argon2.hash(text)
  }

  public compareHash(text: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, text)
  }
}
