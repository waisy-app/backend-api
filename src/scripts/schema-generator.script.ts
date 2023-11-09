import {GraphQLSchemaBuilderModule, GraphQLSchemaFactory} from '@nestjs/graphql'
import {NestFactory} from '@nestjs/core'
import {printSchema} from 'graphql/utilities'
import * as fs from 'fs'
import {AuthResolver} from '../auth/auth.resolver'
import {MailConfirmationResolver} from '../mail-confirmation/mail-confirmation.resolver'

async function schemaGenerator(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule)
  await app.init()

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory)

  // Here we pass the resolvers that we want to include in the schema
  const schema = await gqlSchemaFactory.create([AuthResolver, MailConfirmationResolver])

  const schemaString = printSchema(schema)
  fs.writeFileSync('schema.gql', schemaString)
}

void schemaGenerator()
