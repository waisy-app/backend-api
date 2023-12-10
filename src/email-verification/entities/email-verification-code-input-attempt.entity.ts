import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class EmailVerificationCodeInputAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({comment: 'Email address that the code was sent to'})
  email: string

  @Column({
    comment: 'The IP address of the client that entered the code',
    type: 'inet',
  })
  senderIp: string

  @Column({
    comment: 'The status of the verification attempt',
    type: 'enum',
    enum: ['success', 'failure'],
  })
  status: 'success' | 'failure'

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}
