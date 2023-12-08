import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class SendingVerificationCodeAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({type: 'inet', default: null, nullable: true})
  ipAddress: string | null

  @Column({type: String})
  targetEmail: string

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}
