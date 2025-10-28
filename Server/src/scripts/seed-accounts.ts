import { AppDataSource } from '../config/database';
import { InGameAccount } from '../entities/InGameAccount';
import { v4 as uuidv4 } from 'uuid';

async function seedAccounts() {
    try {
        console.log('🌱 Starting account seeding...');
        
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const accountRepository = AppDataSource.getRepository(InGameAccount);

        // Create 10 test accounts
        const accounts = [];
        for (let i = 1; i <= 10; i++) {
            const account = accountRepository.create({
                accountId: uuidv4(),
                username: `player${i}`,
                displayName: `Player ${i}`,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=player${i}`,
                level: Math.floor(Math.random() * 50) + 1,
                status: 'active',
                isOnline: Math.random() > 0.5,
            });
            accounts.push(account);
        }

        await accountRepository.save(accounts);
        
        console.log('✅ Successfully created 10 test accounts:');
        accounts.forEach((acc, idx) => {
            console.log(`   ${idx + 1}. ${acc.username} (${acc.accountId}) - Level ${acc.level} - ${acc.isOnline ? '🟢 Online' : '⚫ Offline'}`);
        });

        await AppDataSource.destroy();
        console.log('✅ Database connection closed');
        
    } catch (error) {
        console.error('❌ Error seeding accounts:', error);
        process.exit(1);
    }
}

seedAccounts();
