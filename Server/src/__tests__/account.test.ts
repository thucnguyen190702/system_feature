import { AccountService } from '../services/AccountService';
import { AppDataSource } from '../config/database';
import { InGameAccount } from '../entities/InGameAccount';

describe('Account Creation Flow - Integration Tests', () => {
  let accountService: AccountService;
  let accountRepository: any;

  beforeAll(() => {
    accountService = new AccountService();
    accountRepository = AppDataSource.getRepository(InGameAccount);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await accountRepository.query('DELETE FROM accounts WHERE username LIKE $1', ['test_%']);
  });

  describe('Test tạo account thành công', () => {
    it('should create account with unique ID and username', async () => {
      const username = 'test_user_' + Date.now();
      const account = await accountService.createAccount(username);

      expect(account).toBeDefined();
      expect(account.accountId).toBeDefined();
      expect(account.username).toBe(username);
      expect(account.displayName).toBe(username);
      expect(account.level).toBe(1);
      expect(account.status).toBe('active');
      expect(account.isOnline).toBe(false);
    });

    it('should create account with custom display name', async () => {
      const username = 'test_user_' + Date.now();
      const displayName = 'Test Display Name';
      const account = await accountService.createAccount(username, displayName);

      expect(account).toBeDefined();
      expect(account.username).toBe(username);
      expect(account.displayName).toBe(displayName);
    });

    it('should generate unique account ID for each account', async () => {
      const username1 = 'test_user_1_' + Date.now();
      const username2 = 'test_user_2_' + Date.now();

      const account1 = await accountService.createAccount(username1);
      const account2 = await accountService.createAccount(username2);

      expect(account1.accountId).not.toBe(account2.accountId);
    });
  });

  describe('Test duplicate username error', () => {
    it('should throw error when creating account with existing username', async () => {
      const username = 'test_duplicate_' + Date.now();

      // Create first account
      await accountService.createAccount(username);

      // Try to create second account with same username
      await expect(accountService.createAccount(username))
        .rejects
        .toThrow('Username already exists');
    });

    it('should allow creating account after previous account is deleted', async () => {
      const username = 'test_reuse_' + Date.now();

      // Create and delete account
      const account1 = await accountService.createAccount(username);
      await accountRepository.remove(account1);

      // Should be able to create new account with same username
      const account2 = await accountService.createAccount(username);
      expect(account2).toBeDefined();
      expect(account2.username).toBe(username);
    });
  });
});
