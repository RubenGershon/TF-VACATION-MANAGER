// Migration: adds the work calendar (weekly days off, special days) and the "days" column on requests.
import { MigrationInterface, QueryRunner } from "typeorm";

export class WorkCalendar1793700000000 implements MigrationInterface {
    name = 'WorkCalendar1793700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "work_settings" ("id" integer NOT NULL, "non_working_weekdays" integer array NOT NULL DEFAULT '{6,7}', CONSTRAINT "PK_work_settings" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "work_settings" ("id") VALUES (1)`);
        await queryRunner.query(`CREATE TYPE "public"."special_days_type_enum" AS ENUM('HOLIDAY', 'EVENT')`);
        await queryRunner.query(`CREATE TABLE "special_days" ("id" SERIAL NOT NULL, "month_day" character varying(5) NOT NULL, "name" character varying NOT NULL, "type" "public"."special_days_type_enum" NOT NULL DEFAULT 'HOLIDAY', CONSTRAINT "UQ_special_days_month_day" UNIQUE ("month_day"), CONSTRAINT "PK_special_days" PRIMARY KEY ("id"))`);
        // Existing requests keep the number of days they used before the calendar existed
        await queryRunner.query(`ALTER TABLE "vacation_requests" ADD "days" integer`);
        await queryRunner.query(`UPDATE "vacation_requests" SET "days" = "end_date" - "start_date" + 1`);
        await queryRunner.query(`ALTER TABLE "vacation_requests" ALTER COLUMN "days" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vacation_requests" DROP COLUMN "days"`);
        await queryRunner.query(`DROP TABLE "special_days"`);
        await queryRunner.query(`DROP TYPE "public"."special_days_type_enum"`);
        await queryRunner.query(`DROP TABLE "work_settings"`);
    }

}
