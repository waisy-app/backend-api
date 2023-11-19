import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({unique: true})
  email: string

  @Column({
    type: String,
    default: null,
    nullable: true,
    unique: true,
    comment: 'Hashed refresh token',
  })
  refreshToken: string | null

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Is the user activated and is the email confirmed?',
  })
  isActivated: boolean

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
