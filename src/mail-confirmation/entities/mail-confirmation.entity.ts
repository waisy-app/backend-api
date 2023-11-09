import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class MailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  user: User

  @Column({comment: 'Confirmation code from email', type: 'int'})
  code: number

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}

// TODO: автоматическое удаление записи из таблицы mail_confirmation после истечения срока действия кода подтверждения почты
