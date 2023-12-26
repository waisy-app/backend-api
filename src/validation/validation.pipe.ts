import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ValidationPipe as OrigValidationPipe,
} from '@nestjs/common'
import {User} from '../users/entities/user.entity'

@Injectable()
export class ValidationPipe extends OrigValidationPipe implements PipeTransform {
  public async transform(value: any, metadata: ArgumentMetadata): Promise<unknown> {
    if (value instanceof User && metadata.type === 'custom') return value
    return super.transform(value, metadata)
  }
}
