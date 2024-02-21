## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Requirements

- Postgres 16.1
- Node.js 20.10.0

# Generate new migration
1. clear the postgres database of the application
2. `npm run migration:run`
3. `npm run migration:generate`

# Create new migration
1. clear the postgres database of the application
2. `npm run migration:run`
3. `npm run migration:create`
4. write code to the created migration file

# Run migration
1. `npm run migration:run`

# Revert migration
1. `npm run migration:revert`

# Deploy to Container Registry
1. Аутентифицируйтесь в [Container Registry](https://cloud.yandex.ru/ru/docs/container-registry/quickstart)
2. `docker build . -t cr.yandex/<идентификатор_реестра>/waisy-backend-api:<version>`
3. `docker push cr.yandex/<идентификатор_реестра>/waisy-backend-api:<version>`

# Before push commit:
1. Put all config services to `src/config/config.module.ts`
2. Put all env validation schemas to `src/config/env-validatiob-schemas.ts`
3. Put all resolvers to `src/schema-generator.script.ts`
4. Create/generate migrations if it needs
5. If you updated nodejs, change nodejs version in `Dockerfile`, `package.json`, `.github/workflows/node.yml` and `.devcontainer`
6. If you updated postgres, change `.github/workflows/node.yml`
7. `npm run format:check`
8. `npm run link:check`
9. `npm run test`
10. `npm run test:e2e`
11. Push commit
