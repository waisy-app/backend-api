import {MigrationInterface, QueryRunner} from 'typeorm'

export class Migration1708534487221 implements MigrationInterface {
  name = 'Migration1708534487221'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "profile" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "ownerId" uuid NOT NULL,
                CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "profile"
            ADD CONSTRAINT "FK_552aa6698bb78970f6569161ec0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "profile" DROP CONSTRAINT "FK_552aa6698bb78970f6569161ec0"
        `)
    await queryRunner.query(`
            DROP TABLE "profile"
        `)
  }
}
