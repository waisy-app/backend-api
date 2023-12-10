import {CreateDateColumn, Entity, PrimaryGeneratedColumn, Column} from 'typeorm'

@Entity()
export class EmailVerificationCodeSendingAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({comment: 'Email address to which the code was sent'})
  email: string

  @Column({comment: 'The IP address of the client that requested the code', type: 'inet'})
  senderIp: string

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}
