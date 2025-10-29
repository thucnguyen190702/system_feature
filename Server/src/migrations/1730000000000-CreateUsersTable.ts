import { MigrationInterface, QueryRunner, Table, TableIndex, TableCheck } from 'typeorm';

export class CreateUsersTable1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table with all fields for authentication and social features
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          // Authentication fields
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'passwordHash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          // Profile fields (for friend system and other features)
          {
            name: 'displayName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'avatarUrl',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
          // Status fields
          {
            name: 'onlineStatus',
            type: 'varchar',
            length: '20',
            default: "'offline'",
            isNullable: false,
          },
          {
            name: 'lastOnlineAt',
            type: 'timestamp',
            isNullable: true,
          },
          // Privacy settings
          {
            name: 'privacySettings',
            type: 'jsonb',
            default: `'{"allowFriendRequests": true, "showOnlineStatus": true, "showLevel": true}'`,
            isNullable: false,
          },
          // Timestamps
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add index on username for fast lookups during login
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_username',
        columnNames: ['username'],
      }),
    );

    // Add index on online_status for performance when querying online users
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_online_status',
        columnNames: ['onlineStatus'],
      }),
    );

    // Add constraint for username length (3-50 characters)
    await queryRunner.createCheckConstraint(
      'users',
      new TableCheck({
        name: 'chk_username_length',
        expression: 'char_length(username) >= 3 AND char_length(username) <= 50',
      }),
    );

    // Add constraint for valid online status values
    await queryRunner.createCheckConstraint(
      'users',
      new TableCheck({
        name: 'chk_valid_online_status',
        expression: `"onlineStatus" IN ('online', 'offline', 'away', 'busy')`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop check constraints
    await queryRunner.dropCheckConstraint('users', 'chk_valid_online_status');
    await queryRunner.dropCheckConstraint('users', 'chk_username_length');

    // Drop indexes
    await queryRunner.dropIndex('users', 'idx_users_online_status');
    await queryRunner.dropIndex('users', 'idx_users_username');

    // Drop table
    await queryRunner.dropTable('users');
  }
}
