import { SearchService } from '../services/SearchService';
import { AccountService } from '../services/AccountService';
import { AppDataSource } from '../config/database';
import { InGameAccount } from '../entities/InGameAccount';

describe('Search Functionality - Integration Tests', () => {
  let searchService: SearchService;
  let accountService: AccountService;
  let accountRepository: any;

  beforeAll(() => {
    searchService = new SearchService();
    accountService = new AccountService();
    accountRepository = AppDataSource.getRepository(InGameAccount);
  });

  afterEach(async () => {
    // Clean up test data
    await accountRepository.query('DELETE FROM accounts WHERE username LIKE $1', ['test_%']);
  });

  describe('Test search by username', () => {
    it('should find accounts by exact username match', async () => {
      const username = 'test_search_user_' + Date.now();
      await accountService.createAccount(username);

      const results = await searchService.searchByUsername(username);

      expect(results).toHaveLength(1);
      expect(results[0].username).toBe(username);
    });

    it('should find accounts by partial username match', async () => {
      const timestamp = Date.now();
      await accountService.createAccount('test_alice_' + timestamp);
      await accountService.createAccount('test_bob_' + timestamp);
      await accountService.createAccount('test_alice2_' + timestamp);

      const results = await searchService.searchByUsername('alice');

      expect(results.length).toBeGreaterThanOrEqual(2);
      results.forEach(account => {
        expect(account.username.toLowerCase()).toContain('alice');
      });
    });

    it('should return empty array for non-matching query', async () => {
      const results = await searchService.searchByUsername('nonexistentuser12345xyz');
      expect(results).toHaveLength(0);
    });

    it('should return empty array for empty query', async () => {
      const results = await searchService.searchByUsername('');
      expect(results).toHaveLength(0);
    });

    it('should be case-insensitive', async () => {
      const timestamp = Date.now();
      await accountService.createAccount('test_CaseSensitive_' + timestamp);

      const resultsLower = await searchService.searchByUsername('casesensitive');
      const resultsUpper = await searchService.searchByUsername('CASESENSITIVE');
      const resultsMixed = await searchService.searchByUsername('CaseSensitive');

      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsUpper.length).toBeGreaterThan(0);
      expect(resultsMixed.length).toBeGreaterThan(0);
    });

    it('should limit results to 20 accounts', async () => {
      const timestamp = Date.now();
      const prefix = 'test_limit_';

      // Create 25 accounts with same prefix
      const createPromises = [];
      for (let i = 0; i < 25; i++) {
        createPromises.push(accountService.createAccount(`${prefix}${i}_${timestamp}`));
      }
      await Promise.all(createPromises);

      const results = await searchService.searchByUsername(prefix);

      expect(results.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Test search by ID', () => {
    it('should find account by exact ID', async () => {
      const user = await accountService.createAccount('test_user_' + Date.now());

      const result = await searchService.searchById(user.accountId);

      expect(result).toBeDefined();
      expect(result!.accountId).toBe(user.accountId);
      expect(result!.username).toBe(user.username);
    });

    it('should return null for non-existent ID', async () => {
      const result = await searchService.searchById('non-existent-id-12345');
      expect(result).toBeNull();
    });

    it('should return null for empty ID', async () => {
      const result = await searchService.searchById('');
      expect(result).toBeNull();
    });

    it('should return correct account details', async () => {
      const username = 'test_details_' + Date.now();
      const displayName = 'Test Display Name';
      const user = await accountService.createAccount(username, displayName);

      const result = await searchService.searchById(user.accountId);

      expect(result).toBeDefined();
      expect(result!.accountId).toBe(user.accountId);
      expect(result!.username).toBe(username);
      expect(result!.displayName).toBe(displayName);
      expect(result!.level).toBe(1);
      expect(result!.status).toBe('active');
    });
  });
});
