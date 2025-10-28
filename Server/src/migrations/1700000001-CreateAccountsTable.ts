import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAccountsTable1700000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create accounts table
        await queryRunner.createTable(
            new Table({
                name: 'accounts',
                columns: [
                    {
                        name: 'account_id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'display_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'avatar_url',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'level',
                        type: 'integer',
                        default: 1,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '20',
                        default: "'active'",
                    },
                    {
                        name: 'is_online',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'last_seen_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Create index on username for fast lookups
        await queryRunner.createIndex(
            'accounts',
            new TableIndex({
                name: 'idx_accounts_username',
                columnNames: ['username'],
            })
        );

        // Create index on status for filtering
        await queryRunner.createIndex(
            'accounts',
            new TableIndex({
                name: 'idx_accounts_status',
                columnNames: ['status'],
            })
        );

        // Create index on is_online for online status queries
        await queryRunner.createIndex(
            'accounts',
            new TableIndex({
                name: 'idx_accounts_is_online',
                columnNames: ['is_online'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes first
        await queryRunner.dropIndex('accounts', 'idx_accounts_is_online');
        await queryRunner.dropIndex('accounts', 'idx_accounts_status');
        await queryRunner.dropIndex('accounts', 'idx_accounts_username');

        // Drop table
        await queryRunner.dropTable('accounts');
    }
}
