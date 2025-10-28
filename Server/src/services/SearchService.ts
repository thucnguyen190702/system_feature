import { Repository, Like } from 'typeorm';
import { InGameAccount } from '../entities/InGameAccount';
import { AppDataSource } from '../config/database';

export class SearchService {
    private accountRepository: Repository<InGameAccount>;

    constructor() {
        this.accountRepository = AppDataSource.getRepository(InGameAccount);
    }

    /**
     * Search accounts by username
     * Requirements: 2.1
     */
    async searchByUsername(query: string): Promise<InGameAccount[]> {
        if (!query || query.trim().length === 0) {
            return [];
        }

        // Search for accounts with username containing the query (case-insensitive)
        const accounts = await this.accountRepository.find({
            where: {
                username: Like(`%${query}%`)
            },
            take: 20 // Limit results to 20
        });

        return accounts;
    }

    /**
     * Search account by ID
     * Requirements: 2.2
     */
    async searchById(accountId: string): Promise<InGameAccount | null> {
        if (!accountId || accountId.trim().length === 0) {
            return null;
        }

        const account = await this.accountRepository.findOne({
            where: { accountId }
        });

        return account;
    }
}
