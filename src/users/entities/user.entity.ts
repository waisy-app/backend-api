import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {Email} from '../../emails/entities/email.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => Email, {nullable: true})
  @JoinColumn()
  email: Email | null

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
