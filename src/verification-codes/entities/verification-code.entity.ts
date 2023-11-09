import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  user: User

  @Column({comment: 'Confirmation code from email', type: 'int'})
  code: number

  @Column({default: 0, comment: 'Number of sending attempts', type: 'int'})
  sendingAttempts: number

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}
