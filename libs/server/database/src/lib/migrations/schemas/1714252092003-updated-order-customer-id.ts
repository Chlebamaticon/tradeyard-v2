import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedOrderCustomerId1714252092003 implements MigrationInterface {
    name = 'UpdatedOrderCustomerId1714252092003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","order_view","public"]);
        await queryRunner.query(`DROP VIEW "order_view"`);
        await queryRunner.query(`CREATE VIEW "order_view" AS SELECT ("event"."body" ->> 'order_id')::uuid AS "order_id", ("event"."body" ->> 'offer_variant_id')::uuid AS "offer_variant_id", ("event"."body" ->> 'offer_variant_price_id')::uuid AS "offer_variant_price_id", ("event"."body" ->> 'quantity') AS "quantity", ("event"."body" ->> 'contract_id')::uuid AS "contract_id", ("event"."body" ->> 'merchant_id')::uuid AS "merchant_id", ("event"."body" ->> 'customer_id')::uuid AS "customer_id", "event"."created_at" AS "created_at" FROM (SELECT ("inner_event"."body" ->> 'order_id')::uuid AS "order_id", jsonb_recursive_mergeagg("inner_event"."body") AS "body", MIN("inner_event"."created_at") AS "created_at" FROM "events" "inner_event" WHERE ("inner_event"."type" IN ('order:created','order:snapshot')) GROUP BY "inner_event"."body" ->> 'order_id') "event"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","order_view","SELECT (\"event\".\"body\" ->> 'order_id')::uuid AS \"order_id\", (\"event\".\"body\" ->> 'offer_variant_id')::uuid AS \"offer_variant_id\", (\"event\".\"body\" ->> 'offer_variant_price_id')::uuid AS \"offer_variant_price_id\", (\"event\".\"body\" ->> 'quantity') AS \"quantity\", (\"event\".\"body\" ->> 'contract_id')::uuid AS \"contract_id\", (\"event\".\"body\" ->> 'merchant_id')::uuid AS \"merchant_id\", (\"event\".\"body\" ->> 'customer_id')::uuid AS \"customer_id\", \"event\".\"created_at\" AS \"created_at\" FROM (SELECT (\"inner_event\".\"body\" ->> 'order_id')::uuid AS \"order_id\", jsonb_recursive_mergeagg(\"inner_event\".\"body\") AS \"body\", MIN(\"inner_event\".\"created_at\") AS \"created_at\" FROM \"events\" \"inner_event\" WHERE (\"inner_event\".\"type\" IN ('order:created','order:snapshot')) GROUP BY \"inner_event\".\"body\" ->> 'order_id') \"event\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","order_view","public"]);
        await queryRunner.query(`DROP VIEW "order_view"`);
        await queryRunner.query(`CREATE VIEW "order_view" AS SELECT ("event"."body" ->> 'order_id')::uuid AS "order_id", ("event"."body" ->> 'offer_variant_id')::uuid AS "offer_variant_id", ("event"."body" ->> 'offer_variant_price_id')::uuid AS "offer_variant_price_id", ("event"."body" ->> 'quantity') AS "quantity", ("event"."body" ->> 'customer')::jsonb ->> 'address' AS "customer_address", ("event"."body" ->> 'contract_id')::uuid AS "contract_id", ("event"."body" ->> 'merchant_id')::uuid AS "merchant_id", ("event"."body" ->> 'customer_id')::uuid AS "customer_id", "event"."created_at" AS "created_at" FROM (SELECT ("inner_event"."body" ->> 'order_id')::uuid AS "order_id", jsonb_recursive_mergeagg("inner_event"."body") AS "body", MIN("inner_event"."created_at") AS "created_at" FROM "events" "inner_event" WHERE ("inner_event"."type" IN ('order:created','order:snapshot')) GROUP BY "inner_event"."body" ->> 'order_id') "event"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","order_view","SELECT (\"event\".\"body\" ->> 'order_id')::uuid AS \"order_id\", (\"event\".\"body\" ->> 'offer_variant_id')::uuid AS \"offer_variant_id\", (\"event\".\"body\" ->> 'offer_variant_price_id')::uuid AS \"offer_variant_price_id\", (\"event\".\"body\" ->> 'quantity') AS \"quantity\", (\"event\".\"body\" ->> 'customer')::jsonb ->> 'address' AS \"customer_address\", (\"event\".\"body\" ->> 'contract_id')::uuid AS \"contract_id\", (\"event\".\"body\" ->> 'merchant_id')::uuid AS \"merchant_id\", (\"event\".\"body\" ->> 'customer_id')::uuid AS \"customer_id\", \"event\".\"created_at\" AS \"created_at\" FROM (SELECT (\"inner_event\".\"body\" ->> 'order_id')::uuid AS \"order_id\", jsonb_recursive_mergeagg(\"inner_event\".\"body\") AS \"body\", MIN(\"inner_event\".\"created_at\") AS \"created_at\" FROM \"events\" \"inner_event\" WHERE (\"inner_event\".\"type\" IN ('order:created','order:snapshot')) GROUP BY \"inner_event\".\"body\" ->> 'order_id') \"event\""]);
    }

}
