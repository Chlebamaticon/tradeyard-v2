import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * @description
 * This migration does utilisie JSONB deep merging function and introduces a new aggregate function that allow us to merge JSONB in distinct queries.
 */
export class JsonbRecursiveMergeagg1000000000001 implements MigrationInterface {
    name = 'JsonbRecursiveMergeagg1000000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE OR REPLACE AGGREGATE jsonb_recursive_mergeagg(jsonb) (
            SFUNC = 'jsonb_recursive_merge',
            STYPE = jsonb,
            INITCOND = '{}'
          );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          DROP AGGREGATE IF EXISTS jsonb_recursive_mergeagg(jsonb);
        `);
    }

}
