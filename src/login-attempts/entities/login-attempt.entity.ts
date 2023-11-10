import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: true})
  user: User | null

  @Column({type: 'inet', default: null, nullable: true})
  ipAddress: string | null

  @Column({default: false, comment: 'Successful login attempt'})
  isSuccessful: boolean

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}

// TODO: автоматическое удаление записей из таблицы login_attempts с истекшим сроком действия
//  (createdAt более 30-ти дней)
