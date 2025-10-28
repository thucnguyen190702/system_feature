import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { InGameAccount } from '../entities/InGameAccount';
import { FriendRequest } from '../entities/FriendRequest';
import { FriendRelationship } from '../entities/FriendRelationship';
import { BlockedAccount } from '../entities/BlockedAccount';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5126'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'friend_system_db',
    entities: [InGameAccount, FriendRequest, FriendRelationship, BlockedAccount],
    migrations: [__dirname + '/../migrations/*.ts'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
});

export async function initializeDatabase(): Promise<void> {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Error connecting to database:', error);
        throw error;
    }
}
