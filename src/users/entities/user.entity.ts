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
    comment: 'Status of the user',
    type: 'enum',
    enum: ['active', 'unconfirmed'],
    default: 'unconfirmed',
  })
  status: 'active' | 'unconfirmed'

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
