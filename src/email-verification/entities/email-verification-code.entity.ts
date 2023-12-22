import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class EmailVerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  user: User

  @Column({comment: 'The verification code sent via email', type: 'int'})
  code: number

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
