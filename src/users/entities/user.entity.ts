import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @Column({unique: true})
  email: string
  @Column()
  password: string
  @Column({type: String, default: null, nullable: true, unique: true})
  refreshToken?: string | null
}
