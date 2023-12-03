import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false})
  user: User

  @Column({comment: 'The confirmation code sent via email', type: 'int'})
  code: number

  @Column({default: 0, comment: 'Number of sending attempts', type: 'int'})
  sendingAttempts: number

  @Column({
    comment: 'Status of the verification code',
    type: 'enum',
    enum: ['active', 'expired', 'used'],
    default: 'active',
  })
  status: 'active' | 'expired' | 'used'

  @Column({type: 'timestamp with time zone'})
  expirationDate: Date

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
