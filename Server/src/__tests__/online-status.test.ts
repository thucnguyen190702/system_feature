import { FriendService } from '../services/FriendService';
import { AccountService } from '../services/AccountService';
import { AppDataSource } from '../config/database';
import { InGameAccount } from '../entities/InGameAccount';
import { FriendRequest } from '../entities/FriendRequest';
import { FriendRelationship } from '../entities/FriendRelationship';

describe('Online Status - Integration Tests', () => {
  let friendService: FriendService;
  let accountService: AccountService;
  let accountRepository: any;
  let friendRequestRepository: any;
  let friendRelationshipRepository: any;

  beforeAll(() => {
    friendService = new FriendService();
    accountService = new AccountService();
    accountRepository = AppDataSource.getRepository(InGameAccount);
    friendRequestRepository = AppDataSource.getRepository(FriendRequest);
    friendRelationshipRepository = AppDataSource.getRepository(FriendRelationship);
  });

  afterEach(async () => {
    // Clean up test data
    await friendRelationshipRepository.query('DELETE FROM friend_relationships WHERE account_id1 IN (SELECT account_id FROM accounts WHERE username LIKE $1)', ['test_%']);
    await friendRequestRepository.query('DELETE FROM friend_requests WHERE from_account_id IN (SELECT account_id FROM accounts WHERE username LIKE $1)', ['test_%']);
    await accountRepository.query('DELETE FROM accounts WHERE username LIKE $1', ['test_%']);
  });

  describe('Test update online status', () => {
    it('should update online status to true', async () => {
      const user = await accountService.createAccount('test_user_' + Date.now());

      await friendService.updateOnlineStatus(user.accountId, true);

      const updatedUser = await accountService.getAccount(user.accountId);
      expect(updatedUser.isOnline).toBe(true);
      expect(updatedUser.lastSeenAt).toBeDefined();
    });

    it('should update online status to false', async () => {
      const user = await accountService.createAccount('test_user_' + Date.now());

      await friendService.updateOnlineStatus(user.accountId, true);
      await friendService.updateOnlineStatus(user.accountId, false);

      const updatedUser = await accountService.getAccount(user.accountId);
      expect(updatedUser.isOnline).toBe(false);
      expect(updatedUser.lastSeenAt).toBeDefined();
    });

    it('should update lastSeenAt timestamp', async () => {
      const user = await accountService.createAccount('test_user_' + Date.now());

      const beforeUpdate = new Date();
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
      await friendService.updateOnlineStatus(user.accountId, true);

      const updatedUser = await accountService.getAccount(user.accountId);
      expect(updatedUser.lastSeenAt).toBeDefined();
      expect(updatedUser.lastSeenAt!.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });

    it('should throw error when updating non-existent account', async () => {
      await expect(friendService.updateOnlineStatus('non-existent-id', true))
        .rejects
        .toThrow('Account not found');
    });
  });

  describe('Test get friends online status', () => {
    it('should return online status for multiple friends', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());
      const user3 = await accountService.createAccount('test_user3_' + Date.now());

      // Set different online statuses
      await friendService.updateOnlineStatus(user1.accountId, true);
      await friendService.updateOnlineStatus(user2.accountId, false);
      await friendService.updateOnlineStatus(user3.accountId, true);

      // Get batch status
      const statuses = await friendService.getFriendsOnlineStatus([
        user1.accountId,
        user2.accountId,
        user3.accountId
      ]);

      expect(statuses[user1.accountId]).toBe(true);
      expect(statuses[user2.accountId]).toBe(false);
      expect(statuses[user3.accountId]).toBe(true);
    });

    it('should return empty object for empty account list', async () => {
      const statuses = await friendService.getFriendsOnlineStatus([]);
      expect(statuses).toEqual({});
    });

    it('should only return status for existing accounts', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      await friendService.updateOnlineStatus(user1.accountId, true);

      const statuses = await friendService.getFriendsOnlineStatus([
        user1.accountId,
        'non-existent-id'
      ]);

      expect(statuses[user1.accountId]).toBe(true);
      expect(statuses['non-existent-id']).toBeUndefined();
    });

    it('should reflect real-time status changes', async () => {
      const user = await accountService.createAccount('test_user_' + Date.now());

      await friendService.updateOnlineStatus(user.accountId, true);
      let statuses = await friendService.getFriendsOnlineStatus([user.accountId]);
      expect(statuses[user.accountId]).toBe(true);

      await friendService.updateOnlineStatus(user.accountId, false);
      statuses = await friendService.getFriendsOnlineStatus([user.accountId]);
      expect(statuses[user.accountId]).toBe(false);
    });
  });
});
