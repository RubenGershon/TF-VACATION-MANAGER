// Migration: creates the users and vacation_requests tables.
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1793605309592 implements MigrationInterface {
    name = 'InitialSchema1793605309592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vacation_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "vacation_requests" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "reason" text, "status" "public"."vacation_requests_status_enum" NOT NULL DEFAULT 'PENDING', "comments" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e8ca8afb59b9a4350c339b66843" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74443281944f02ae8e386fa07b" ON "vacation_requests"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f834c38260aba3409c9bdb7b1" ON "vacation_requests"  ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('REQUESTER', 'VALIDATOR')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "vacation_allowance" integer NOT NULL DEFAULT '25', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vacation_requests" ADD CONSTRAINT "FK_74443281944f02ae8e386fa07b8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vacation_requests" DROP CONSTRAINT "FK_74443281944f02ae8e386fa07b8"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f834c38260aba3409c9bdb7b1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74443281944f02ae8e386fa07b"`);
        await queryRunner.query(`DROP TABLE "vacation_requests"`);
        await queryRunner.query(`DROP TYPE "public"."vacation_requests_status_enum"`);
    }

}
