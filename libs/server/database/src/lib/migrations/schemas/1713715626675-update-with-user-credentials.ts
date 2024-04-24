import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWithUserCredentials1713715626675 implements MigrationInterface {
    name = 'UpdateWithUserCredentials1713715626675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "user_credential_view" AS SELECT ("event"."body" ->> 'user_credential_id')::uuid AS "user_credential_id", ("event"."body" ->> 'user_id')::uuid AS "user_id", ("event"."body" ->> 'type')::varchar AS "type", ("event"."body" ->> 'hash')::varchar AS "hash", ("event"."body" ->> 'salt')::varchar AS "salt", "event"."created_at" AS "created_at" FROM (SELECT ("inner_event"."body" ->> 'user_credential_id')::uuid AS "user_credential_id", jsonb_recursive_mergeagg("inner_event"."body") AS "body", MIN("inner_event"."created_at") AS "created_at" FROM "events" "inner_event" WHERE ("inner_event"."type" IN ('user:credential:created','user:credential:snapshot')) GROUP BY "inner_event"."body" ->> 'user_credential_id') "event"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","user_credential_view","SELECT (\"event\".\"body\" ->> 'user_credential_id')::uuid AS \"user_credential_id\", (\"event\".\"body\" ->> 'user_id')::uuid AS \"user_id\", (\"event\".\"body\" ->> 'type')::varchar AS \"type\", (\"event\".\"body\" ->> 'hash')::varchar AS \"hash\", (\"event\".\"body\" ->> 'salt')::varchar AS \"salt\", \"event\".\"created_at\" AS \"created_at\" FROM (SELECT (\"inner_event\".\"body\" ->> 'user_credential_id')::uuid AS \"user_credential_id\", jsonb_recursive_mergeagg(\"inner_event\".\"body\") AS \"body\", MIN(\"inner_event\".\"created_at\") AS \"created_at\" FROM \"events\" \"inner_event\" WHERE (\"inner_event\".\"type\" IN ('user:credential:created','user:credential:snapshot')) GROUP BY \"inner_event\".\"body\" ->> 'user_credential_id') \"event\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","user_credential_view","public"]);
        await queryRunner.query(`DROP VIEW "user_credential_view"`);
    }

}
