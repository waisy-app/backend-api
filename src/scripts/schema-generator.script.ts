import {GraphQLSchemaBuilderModule, GraphQLSchemaFactory} from '@nestjs/graphql'
import {NestFactory} from '@nestjs/core'
import {printSchema} from 'graphql/utilities'
import * as fs from 'fs'
import {AuthResolver} from '../auth/auth.resolver'
import {VerificationCodesResolver} from '../verification-codes/verification-codes.resolver'

async function schemaGenerator(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule)
  await app.init()
  const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
  const schema = await gqlSchemaFactory.create([AuthResolver, VerificationCodesResolver])
  const schemaString = printSchema(schema)
  const schemaFilePath = 'schema.gql'
  fs.writeFileSync(schemaFilePath, schemaString)
}

void schemaGenerator()
