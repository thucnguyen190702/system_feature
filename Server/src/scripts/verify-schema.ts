import { AppDataSource } from '../config/database';

async function verifySchema() {
    try {
        console.log('🔍 Connecting to database...');
        await AppDataSource.initialize();
        console.log('✅ Database connection established');

        const queryRunner = AppDataSource.createQueryRunner();

        // Verify accounts table
        console.log('\n📋 Verifying accounts table...');
        const accountsTable = await queryRunner.getTable('accounts');
        if (accountsTable) {
            console.log('✅ accounts table exists');
            console.log(`   Columns: ${accountsTable.columns.map(c => c.name).join(', ')}`);
            console.log(`   Indexes: ${accountsTable.indices.map(i => i.name).join(', ')}`);
        } else {
            console.log('❌ accounts table not found');
        }

        // Verify friend_requests table
        console.log('\n📋 Verifying friend_requests table...');
        const friendRequestsTable = await queryRunner.getTable('friend_requests');
        if (friendRequestsTable) {
            console.log('✅ friend_requests table exists');
            console.log(`   Columns: ${friendRequestsTable.columns.map(c => c.name).join(', ')}`);
            console.log(`   Indexes: ${friendRequestsTable.indices.map(i => i.name).join(', ')}`);
            console.log(`   Foreign Keys: ${friendRequestsTable.foreignKeys.map(fk => fk.name).join(', ')}`);
        } else {
            console.log('❌ friend_requests table not found');
        }

        // Verify friend_relationships table
        console.log('\n📋 Verifying friend_relationships table...');
        const friendRelationshipsTable = await queryRunner.getTable('friend_relationships');
        if (friendRelationshipsTable) {
            console.log('✅ friend_relationships table exists');
            console.log(`   Columns: ${friendRelationshipsTable.columns.map(c => c.name).join(', ')}`);
            console.log(`   Indexes: ${friendRelationshipsTable.indices.map(i => i.name).join(', ')}`);
            console.log(`   Foreign Keys: ${friendRelationshipsTable.foreignKeys.map(fk => fk.name).join(', ')}`);
            console.log(`   Unique Constraints: ${friendRelationshipsTable.uniques.map(u => u.name).join(', ')}`);
        } else {
            console.log('❌ friend_relationships table not found');
        }

        // Check migrations table
        console.log('\n📋 Checking migrations...');
        const migrations = await queryRunner.query('SELECT * FROM migrations ORDER BY timestamp');
        console.log(`✅ ${migrations.length} migrations executed:`);
        migrations.forEach((m: any) => {
            console.log(`   - ${m.name} (${new Date(parseInt(m.timestamp)).toISOString()})`);
        });

        await queryRunner.release();
        await AppDataSource.destroy();

        console.log('\n✅ Schema verification completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Schema verification failed:', error);
        process.exit(1);
    }
}

verifySchema();
