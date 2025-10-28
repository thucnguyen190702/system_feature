import { Repository } from 'typeorm';
import { InGameAccount } from '../entities/InGameAccount';
import { AppDataSource } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';

export class AccountService {
    private accountRepository: Repository<InGameAccount>;

    constructor() {
        this.accountRepository = AppDataSource.getRepository(InGameAccount);
    }

    /**
     * Create a new account with unique ID
     * Requirements: 1.1, 1.2, 5.1
     */
    async createAccount(username: string, displayName?: string): Promise<InGameAccount> {
        // Validate username uniqueness
        const existingAccount = await this.accountRepository.findOne({
            where: { username }
        });

        if (existingAccount) {
            throw new Error('Username already exists');
        }

        // Generate unique ID
        const accountId = uuidv4();

        // Create account entity
        const account = this.accountRepository.create({
            accountId,
            username,
            displayName: displayName || username,
            level: 1,
            status: 'active',
            isOnline: false,
            avatarUrl: null,
            lastSeenAt: null
        });

        // Validate entity
        const errors = await validate(account);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
        }

        // Save to database
        return await this.accountRepository.save(account);
    }

    /**
     * Get account by ID
     * Requirements: 1.1
     */
    async getAccount(accountId: string): Promise<InGameAccount> {
        const account = await this.accountRepository.findOne({
            where: { accountId }
        });

        if (!account) {
            throw new Error('Account not found');
        }

        return account;
    }

    /**
     * Update account information
     * Requirements: 1.3, 1.4
     */
    async updateAccount(accountId: string, updateData: Partial<InGameAccount>): Promise<InGameAccount> {
        // Get existing account
        const account = await this.getAccount(accountId);

        // Validate username uniqueness if username is being updated
        if (updateData.username && updateData.username !== account.username) {
            const existingAccount = await this.accountRepository.findOne({
                where: { username: updateData.username }
            });

            if (existingAccount) {
                throw new Error('Username already exists');
            }
        }

        // Filter allowed update fields
        const allowedFields: (keyof InGameAccount)[] = ['displayName', 'avatarUrl', 'level', 'status', 'username'];
        const filteredData: Partial<InGameAccount> = {};

        for (const key of allowedFields) {
            if (key in updateData && updateData[key] !== undefined) {
                (filteredData as any)[key] = updateData[key];
            }
        }

        // Merge update data
        Object.assign(account, filteredData);

        // Validate updated entity
        const errors = await validate(account);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
        }

        // Save updated account
        return await this.accountRepository.save(account);
    }

    /**
     * Hash sensitive data (utility method for security requirement 5.1)
     */
    async hashSensitiveData(data: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(data, saltRounds);
    }

    /**
     * Verify hashed data (utility method)
     */
    async verifySensitiveData(data: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(data, hash);
    }
}
