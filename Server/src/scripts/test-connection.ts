import { AppDataSource } from '../config/database';

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Port: ${process.env.DB_PORT || '5126'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'system_db'}`);
        console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
        
        await AppDataSource.initialize();
        console.log('✅ Database connection successful!');
        
        // Test a simple query
        const result = await AppDataSource.query('SELECT NOW()');
        console.log(`✅ Database time: ${result[0].now}`);
        
        await AppDataSource.destroy();
        console.log('✅ Connection closed successfully');
        process.exit(0);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Database connection failed:', errorMessage);
        console.error('\nPlease ensure:');
        console.error('1. PostgreSQL is running');
        console.error('2. Database credentials in .env are correct');
        console.error('3. Database "friend_system_db" exists');
        process.exit(1);
    }
}

testConnection();
