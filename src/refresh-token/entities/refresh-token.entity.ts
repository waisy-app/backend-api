import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
@Index(['user', 'deviceInfo'], {unique: true, where: '"status" = \'active\''})
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    comment: 'Status of token',
  })
  status: 'active' | 'inactive'

  @Column({
    type: String,
    unique: true,
    comment: 'Hashed refresh token',
  })
  refreshToken: string

  @Column({
    type: String,
    comment: 'Device information',
  })
  deviceInfo: string

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false})
  @JoinColumn()
  user: User

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
