import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({unique: true})
  email: string

  @Column({type: String, default: null, nullable: true, comment: 'Hashed password'})
  password: string | null

  @Column({
    type: String,
    default: null,
    nullable: true,
    unique: true,
    comment: 'Hashed refresh token',
  })
  refreshToken: string | null
}
