import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWithUserWallet1713912750364 implements MigrationInterface {
    name = 'UpdateWithUserWallet1713912750364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "user_wallet_view" AS SELECT ("event"."body" ->> 'user_wallet_id')::uuid AS "user_wallet_id", ("event"."body" ->> 'user_id')::uuid AS "user_id", ("event"."body" ->> 'chain')::varchar AS "chain", ("event"."body" ->> 'address')::varchar AS "address", ("event"."body" ->> 'type')::varchar AS "type", "event"."created_at" AS "created_at" FROM (SELECT ("inner_event"."body" ->> 'user_wallet_id')::uuid AS "user_wallet_id", jsonb_recursive_mergeagg("inner_event"."body") AS "body", MIN("inner_event"."created_at") AS "created_at" FROM "events" "inner_event" WHERE ("inner_event"."type" IN ('user:wallet:created')) GROUP BY "inner_event"."body" ->> 'user_wallet_id') "event"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","user_wallet_view","SELECT (\"event\".\"body\" ->> 'user_wallet_id')::uuid AS \"user_wallet_id\", (\"event\".\"body\" ->> 'user_id')::uuid AS \"user_id\", (\"event\".\"body\" ->> 'chain')::varchar AS \"chain\", (\"event\".\"body\" ->> 'address')::varchar AS \"address\", (\"event\".\"body\" ->> 'type')::varchar AS \"type\", \"event\".\"created_at\" AS \"created_at\" FROM (SELECT (\"inner_event\".\"body\" ->> 'user_wallet_id')::uuid AS \"user_wallet_id\", jsonb_recursive_mergeagg(\"inner_event\".\"body\") AS \"body\", MIN(\"inner_event\".\"created_at\") AS \"created_at\" FROM \"events\" \"inner_event\" WHERE (\"inner_event\".\"type\" IN ('user:wallet:created')) GROUP BY \"inner_event\".\"body\" ->> 'user_wallet_id') \"event\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","user_wallet_view","public"]);
        await queryRunner.query(`DROP VIEW "user_wallet_view"`);
    }

}
