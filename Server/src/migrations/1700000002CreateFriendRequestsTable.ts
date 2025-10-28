import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateFriendRequestsTable1700000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create friend_requests table
        await queryRunner.createTable(
            new Table({
                name: 'friend_requests',
                columns: [
                    {
                        name: 'request_id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'from_account_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'to_account_id',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '20',
                        default: "'pending'",
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

        // Create foreign key for from_account_id
        await queryRunner.createForeignKey(
            'friend_requests',
            new TableForeignKey({
                name: 'fk_friend_requests_from_account',
                columnNames: ['from_account_id'],
                referencedTableName: 'accounts',
                referencedColumnNames: ['account_id'],
                onDelete: 'CASCADE',
            })
        );

        // Create foreign key for to_account_id
        await queryRunner.createForeignKey(
            'friend_requests',
            new TableForeignKey({
                name: 'fk_friend_requests_to_account',
                columnNames: ['to_account_id'],
                referencedTableName: 'accounts',
                referencedColumnNames: ['account_id'],
                onDelete: 'CASCADE',
            })
        );

        // Create index on from_account_id for queries
        await queryRunner.createIndex(
            'friend_requests',
            new TableIndex({
                name: 'idx_friend_requests_from',
                columnNames: ['from_account_id'],
            })
        );

        // Create index on to_account_id for queries
        await queryRunner.createIndex(
            'friend_requests',
            new TableIndex({
                name: 'idx_friend_requests_to',
                columnNames: ['to_account_id'],
            })
        );

        // Create index on status for filtering pending requests
        await queryRunner.createIndex(
            'friend_requests',
            new TableIndex({
                name: 'idx_friend_requests_status',
                columnNames: ['status'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes first
        await queryRunner.dropIndex('friend_requests', 'idx_friend_requests_status');
        await queryRunner.dropIndex('friend_requests', 'idx_friend_requests_to');
        await queryRunner.dropIndex('friend_requests', 'idx_friend_requests_from');

        // Drop foreign keys
        await queryRunner.dropForeignKey('friend_requests', 'fk_friend_requests_to_account');
        await queryRunner.dropForeignKey('friend_requests', 'fk_friend_requests_from_account');

        // Drop table
        await queryRunner.dropTable('friend_requests');
    }
}
