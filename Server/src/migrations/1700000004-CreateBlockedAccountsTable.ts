import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBlockedAccountsTable1700000004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create blocked_accounts table
        await queryRunner.createTable(
            new Table({
                name: 'blocked_accounts',
                columns: [
                    {
                        name: 'block_id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'blocker_account_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'blocked_account_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'reason',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Create unique constraint to prevent duplicate blocks
        await queryRunner.createIndex(
            'blocked_accounts',
            new TableIndex({
                name: 'idx_blocked_accounts_unique',
                columnNames: ['blocker_account_id', 'blocked_account_id'],
                isUnique: true,
            })
        );

        // Create index on blocker_account_id for faster lookups
        await queryRunner.createIndex(
            'blocked_accounts',
            new TableIndex({
                name: 'idx_blocked_accounts_blocker',
                columnNames: ['blocker_account_id'],
            })
        );

        // Create index on blocked_account_id for faster lookups
        await queryRunner.createIndex(
            'blocked_accounts',
            new TableIndex({
                name: 'idx_blocked_accounts_blocked',
                columnNames: ['blocked_account_id'],
            })
        );

        // Add foreign key constraint for blocker_account_id
        await queryRunner.createForeignKey(
            'blocked_accounts',
            new TableForeignKey({
                name: 'fk_blocked_accounts_blocker',
                columnNames: ['blocker_account_id'],
                referencedTableName: 'accounts',
                referencedColumnNames: ['account_id'],
                onDelete: 'CASCADE',
            })
        );

        // Add foreign key constraint for blocked_account_id
        await queryRunner.createForeignKey(
            'blocked_accounts',
            new TableForeignKey({
                name: 'fk_blocked_accounts_blocked',
                columnNames: ['blocked_account_id'],
                referencedTableName: 'accounts',
                referencedColumnNames: ['account_id'],
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.dropForeignKey('blocked_accounts', 'fk_blocked_accounts_blocked');
        await queryRunner.dropForeignKey('blocked_accounts', 'fk_blocked_accounts_blocker');

        // Drop indexes
        await queryRunner.dropIndex('blocked_accounts', 'idx_blocked_accounts_blocked');
        await queryRunner.dropIndex('blocked_accounts', 'idx_blocked_accounts_blocker');
        await queryRunner.dropIndex('blocked_accounts', 'idx_blocked_accounts_unique');

        // Drop table
        await queryRunner.dropTable('blocked_accounts');
    }
}
