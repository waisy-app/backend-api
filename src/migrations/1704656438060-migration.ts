import {MigrationInterface, QueryRunner} from 'typeorm'

export class Migration1704656438060 implements MigrationInterface {
  name = 'Migration1704656438060'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."email_verification_code_input_attempt_status_enum" AS ENUM('success', 'failure')
        `)
    await queryRunner.query(`
            CREATE TABLE "email_verification_code_input_attempt" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "senderIp" inet NOT NULL,
                "status" "public"."email_verification_code_input_attempt_status_enum" NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8d50b1c50ee28684f3207e9f560" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "email_verification_code_input_attempt"."email" IS 'Email address that the code was sent to';
            COMMENT ON COLUMN "email_verification_code_input_attempt"."senderIp" IS 'The IP address of the client that entered the code';
            COMMENT ON COLUMN "email_verification_code_input_attempt"."status" IS 'The status of the verification attempt'
        `)
    await queryRunner.query(`
            CREATE TABLE "email_verification_code_sending_attempt" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "senderIp" inet NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a5a612a41a1b640702da6638861" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "email_verification_code_sending_attempt"."email" IS 'Email address to which the code was sent';
            COMMENT ON COLUMN "email_verification_code_sending_attempt"."senderIp" IS 'The IP address of the client that requested the code'
        `)
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TYPE "public"."refresh_token_status_enum" AS ENUM('active', 'inactive')
        `)
    await queryRunner.query(`
            CREATE TABLE "refresh_token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."refresh_token_status_enum" NOT NULL DEFAULT 'active',
                "refreshToken" character varying NOT NULL,
                "deviceInfo" character varying NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL,
                CONSTRAINT "UQ_428e14ded7299edfcf58918beaf" UNIQUE ("refreshToken"),
                CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "refresh_token"."status" IS 'Status of token';
            COMMENT ON COLUMN "refresh_token"."refreshToken" IS 'Hashed refresh token';
            COMMENT ON COLUMN "refresh_token"."deviceInfo" IS 'Device information'
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_c98a57bf5874dc146aa6360fd0" ON "refresh_token" ("userId", "deviceInfo")
            WHERE "status" = 'active'
        `)
    await queryRunner.query(`
            CREATE TYPE "public"."email_verification_code_status_enum" AS ENUM('active', 'expired', 'used')
        `)
    await queryRunner.query(`
            CREATE TABLE "email_verification_code" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" integer NOT NULL,
                "status" "public"."email_verification_code_status_enum" NOT NULL DEFAULT 'active',
                "expirationDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_7fc72ac16aeeab466c48748221c" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "email_verification_code"."code" IS 'The verification code sent via email';
            COMMENT ON COLUMN "email_verification_code"."status" IS 'Status of the verification code'
        `)
    await queryRunner.query(`
            ALTER TABLE "refresh_token"
            ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "email_verification_code"
            ADD CONSTRAINT "FK_cace043f9e8bee80c2dd5c66ccc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            CREATE TABLE "query-result-cache" (
                "id" SERIAL NOT NULL,
                "identifier" character varying,
                "time" bigint NOT NULL,
                "duration" integer NOT NULL,
                "query" text NOT NULL,
                "result" text NOT NULL,
                CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id")
            )
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "query-result-cache"
        `)
    await queryRunner.query(`
            ALTER TABLE "email_verification_code" DROP CONSTRAINT "FK_cace043f9e8bee80c2dd5c66ccc"
        `)
    await queryRunner.query(`
            ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"
        `)
    await queryRunner.query(`
            DROP TABLE "email_verification_code"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."email_verification_code_status_enum"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c98a57bf5874dc146aa6360fd0"
        `)
    await queryRunner.query(`
            DROP TABLE "refresh_token"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."refresh_token_status_enum"
        `)
    await queryRunner.query(`
            DROP TABLE "user"
        `)
    await queryRunner.query(`
            DROP TABLE "email_verification_code_sending_attempt"
        `)
    await queryRunner.query(`
            DROP TABLE "email_verification_code_input_attempt"
        `)
    await queryRunner.query(`
            DROP TYPE "public"."email_verification_code_input_attempt_status_enum"
        `)
  }
}
