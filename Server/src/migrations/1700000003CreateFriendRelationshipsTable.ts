import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateFriendRelationshipsTable1700000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create friend_relationships table
        await queryRunner.createTable(
            new Table({
                name: 'friend_relationships',
                columns: [
                    {
                        name: 'relationship_id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'account_id1',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'account_id2',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
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

        // Create foreign key for account_id1
        await queryRunner.createForeignKey(
            'friend_relationships',
            new TableForeignKey({
                name: 'fk_friend_relationships_account1',
                columnNames: ['account_id1'],
                referencedTableName: 'accounts',
                referencedColumnNames: ['account_id'],
                onDelete: 'CASCADE',
            })
        );

        // Create foreign key for account_id2
        await queryRunner.createForeignKey(
            'friend_relationships',
            new TableForeignKey({
                name: 'fk_friend_relationships_account2',
                columnNames: ['account_id2'],
                referencedTableName: 'accounts',
                referencedColumnNames: ['account_id'],
                onDelete: 'CASCADE',
            })
        );

        // Create unique constraint to prevent duplicate friendships
        await queryRunner.createUniqueConstraint(
            'friend_relationships',
            new TableUnique({
                name: 'uq_friend_relationships_accounts',
                columnNames: ['account_id1', 'account_id2'],
            })
        );

        // Create index on account_id1 for fast lookups
        await queryRunner.createIndex(
            'friend_relationships',
            new TableIndex({
                name: 'idx_friend_relationships_account1',
                columnNames: ['account_id1'],
            })
        );

        // Create index on account_id2 for fast lookups
        await queryRunner.createIndex(
            'friend_relationships',
            new TableIndex({
                name: 'idx_friend_relationships_account2',
                columnNames: ['account_id2'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes first
        await queryRunner.dropIndex('friend_relationships', 'idx_friend_relationships_account2');
        await queryRunner.dropIndex('friend_relationships', 'idx_friend_relationships_account1');

        // Drop unique constraint
        await queryRunner.dropUniqueConstraint('friend_relationships', 'uq_friend_relationships_accounts');

        // Drop foreign keys
        await queryRunner.dropForeignKey('friend_relationships', 'fk_friend_relationships_account2');
        await queryRunner.dropForeignKey('friend_relationships', 'fk_friend_relationships_account1');

        // Drop table
        await queryRunner.dropTable('friend_relationships');
    }
}
