import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({unique: true})
  email: string

  // Email does not have a status field because it is not necessary to deactivate/activate it
  //  and email notifications will be realized by another service and another entity

  @OneToOne(() => User, {onDelete: 'CASCADE', nullable: false})
  @JoinColumn()
  user: User

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
