import {GraphQLSchemaBuilderModule, GraphQLSchemaFactory} from '@nestjs/graphql'
import {NestFactory} from '@nestjs/core'
import {printSchema} from 'graphql/utilities'
import * as fs from 'fs'
import {EmailVerificationResolver} from './email-verification/email-verification.resolver'
import {RefreshTokenResolver} from './refresh-token/refresh-token.resolver'
import {UnisenderResolver} from './unisender/unisender.resolver'

async function schemaGenerator(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule)
  await app.init()
  const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
  // Put all resolvers here
  const schema = await gqlSchemaFactory.create([
    RefreshTokenResolver,
    EmailVerificationResolver,
    UnisenderResolver,
  ])
  const schemaString = printSchema(schema)
  const schemaFilePath = 'schema.gql'
  fs.writeFileSync(schemaFilePath, schemaString)
}

void schemaGenerator()
