import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedOrderWithMerchantId1714296842985 implements MigrationInterface {
    name = 'UpdatedOrderWithMerchantId1714296842985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","offer_view","public"]);
        await queryRunner.query(`DROP VIEW "offer_view"`);
        await queryRunner.query(`CREATE VIEW "offer_view" AS SELECT ("event"."body" ->> 'offer_id')::uuid AS "offer_id", ("event"."body" ->> 'title') AS "title", ("event"."body" ->> 'description') AS "description", ("event"."body" ->> 'merchant_id')::uuid AS "merchant_id", "event"."created_at" AS "created_at" FROM (SELECT ("inner_event"."body" ->> 'offer_id')::uuid AS "offer_id", jsonb_recursive_mergeagg("inner_event"."body") AS "body", MIN("inner_event"."created_at") AS "created_at" FROM "events" "inner_event" WHERE ("inner_event"."type" IN ('offer:created','offer:updated','offer:snapshot')) GROUP BY "inner_event"."body" ->> 'offer_id') "event"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","offer_view","SELECT (\"event\".\"body\" ->> 'offer_id')::uuid AS \"offer_id\", (\"event\".\"body\" ->> 'title') AS \"title\", (\"event\".\"body\" ->> 'description') AS \"description\", (\"event\".\"body\" ->> 'merchant_id')::uuid AS \"merchant_id\", \"event\".\"created_at\" AS \"created_at\" FROM (SELECT (\"inner_event\".\"body\" ->> 'offer_id')::uuid AS \"offer_id\", jsonb_recursive_mergeagg(\"inner_event\".\"body\") AS \"body\", MIN(\"inner_event\".\"created_at\") AS \"created_at\" FROM \"events\" \"inner_event\" WHERE (\"inner_event\".\"type\" IN ('offer:created','offer:updated','offer:snapshot')) GROUP BY \"inner_event\".\"body\" ->> 'offer_id') \"event\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","offer_view","public"]);
        await queryRunner.query(`DROP VIEW "offer_view"`);
        await queryRunner.query(`CREATE VIEW "offer_view" AS SELECT ("event"."body" ->> 'offer_id')::uuid AS "offer_id", ("event"."body" ->> 'user_id')::uuid AS "user_id", ("event"."body" ->> 'title') AS "title", ("event"."body" ->> 'description') AS "description", ("event"."body" ->> 'merchant_id') AS "merchant_id", "event"."created_at" AS "created_at" FROM (SELECT ("inner_event"."body" ->> 'offer_id')::uuid AS "offer_id", jsonb_recursive_mergeagg("inner_event"."body") AS "body", MIN("inner_event"."created_at") AS "created_at" FROM "events" "inner_event" WHERE ("inner_event"."type" IN ('offer:created','offer:updated','offer:snapshot')) GROUP BY "inner_event"."body" ->> 'offer_id') "event"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","offer_view","SELECT (\"event\".\"body\" ->> 'offer_id')::uuid AS \"offer_id\", (\"event\".\"body\" ->> 'user_id')::uuid AS \"user_id\", (\"event\".\"body\" ->> 'title') AS \"title\", (\"event\".\"body\" ->> 'description') AS \"description\", (\"event\".\"body\" ->> 'merchant_id') AS \"merchant_id\", \"event\".\"created_at\" AS \"created_at\" FROM (SELECT (\"inner_event\".\"body\" ->> 'offer_id')::uuid AS \"offer_id\", jsonb_recursive_mergeagg(\"inner_event\".\"body\") AS \"body\", MIN(\"inner_event\".\"created_at\") AS \"created_at\" FROM \"events\" \"inner_event\" WHERE (\"inner_event\".\"type\" IN ('offer:created','offer:updated','offer:snapshot')) GROUP BY \"inner_event\".\"body\" ->> 'offer_id') \"event\""]);
    }

}
