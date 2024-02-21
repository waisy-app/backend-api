import {Field, ObjectType} from '@nestjs/graphql'

@ObjectType({description: 'The profile model'})
export class Profile {
  @Field({description: 'The ID of the profile'})
  id: string

  @Field({description: 'The title of the profile'})
  title: string
}
