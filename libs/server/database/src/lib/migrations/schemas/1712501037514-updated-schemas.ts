import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchemas1712501037514 implements MigrationInterface {
    name = 'UpdatedSchemas1712501037514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "token_view" AS SELECT ("event"."body" ->> 'token_id')::uuid AS "token_id", ("event"."body" ->> 'symbol')::varchar AS "symbol", ("event"."body" ->> 'precision')::int AS "precision", ("event"."body" ->> 'name')::varchar AS "name", "event"."created_at" AS "created_at" FROM (SELECT ("inner_event"."body" ->> 'token_id')::uuid AS "token_id", jsonb_recursive_mergeagg("inner_event"."body") AS "body", MIN("inner_event"."created_at") AS "created_at" FROM "events" "inner_event" WHERE ("inner_event"."type" IN ('token:created','token:updated','token:snapshot')) GROUP BY "inner_event"."body" ->> 'token_id') "event"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","token_view","SELECT (\"event\".\"body\" ->> 'token_id')::uuid AS \"token_id\", (\"event\".\"body\" ->> 'symbol')::varchar AS \"symbol\", (\"event\".\"body\" ->> 'precision')::int AS \"precision\", (\"event\".\"body\" ->> 'name')::varchar AS \"name\", \"event\".\"created_at\" AS \"created_at\" FROM (SELECT (\"inner_event\".\"body\" ->> 'token_id')::uuid AS \"token_id\", jsonb_recursive_mergeagg(\"inner_event\".\"body\") AS \"body\", MIN(\"inner_event\".\"created_at\") AS \"created_at\" FROM \"events\" \"inner_event\" WHERE (\"inner_event\".\"type\" IN ('token:created','token:updated','token:snapshot')) GROUP BY \"inner_event\".\"body\" ->> 'token_id') \"event\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","token_view","public"]);
        await queryRunner.query(`DROP VIEW "token_view"`);
    }

}
