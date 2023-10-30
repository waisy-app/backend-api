import {GraphQLSchemaBuilderModule, GraphQLSchemaFactory} from '@nestjs/graphql'
import {NestFactory} from '@nestjs/core'
import {printSchema} from 'graphql/utilities'
import {UsersResolver} from './users/users.resolver'
import * as fs from 'fs'

async function schemaGenerator() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule)
  await app.init()

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
  const schema = await gqlSchemaFactory.create([UsersResolver])

  const schemaString = printSchema(schema)

  fs.writeFileSync('schema.gql', schemaString)
}

void schemaGenerator()
