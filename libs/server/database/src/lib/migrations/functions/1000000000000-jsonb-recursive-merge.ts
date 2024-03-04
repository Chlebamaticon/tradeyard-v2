import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * @description
 * This migration does introduce JSONB deep merging function - it does rely on creating two temporary tables for each object and recursively merging them.
 * @references
 *  - https://medium.com/hootsuite-engineering/recursively-merging-jsonb-in-postgresql-efd787c9fad7
 *  - https://stackoverflow.com/questions/42944888/merging-jsonb-values-in-postgresql
 */
export class JsonbRecursiveMerge1000000000000 implements MigrationInterface {
    name = 'JsonbRecursiveMerge1000000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE OR REPLACE FUNCTION jsonb_recursive_merge(a jsonb, b jsonb)
          RETURNS jsonb LANGUAGE SQL AS $$
          SELECT
              jsonb_object_agg(
                  COALESCE(ka, kb),
                  CASE
                      WHEN va ISNULL THEN vb
                      WHEN vb isnull THEN va
                      WHEN va = vb THEN vb
                      WHEN jsonb_typeof(va) <> 'object' OR jsonb_typeof(vb) <> 'object' THEN vb
                      ELSE jsonb_recursive_merge(va, vb) END
                  )
              FROM jsonb_each(a) e1(ka, va)
              FULL JOIN jsonb_each(b) e2(kb, vb) ON ka = kb
          $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          DROP FUNCTION IF EXISTS jsonb_recursive_merge(a jsonb, b jsonb);
        `);
    }

}
