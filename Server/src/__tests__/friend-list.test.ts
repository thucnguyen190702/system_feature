import { FriendService } from '../services/FriendService';
import { AccountService } from '../services/AccountService';
import { AppDataSource } from '../config/database';
import { InGameAccount } from '../entities/InGameAccount';
import { FriendRequest } from '../entities/FriendRequest';
import { FriendRelationship } from '../entities/FriendRelationship';

describe('Friend List Operations - Integration Tests', () => {
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

  describe('Test get friend list', () => {
    it('should return empty list when user has no friends', async () => {
      const user = await accountService.createAccount('test_user_' + Date.now());
      const friends = await friendService.getFriendList(user.accountId);

      expect(friends).toHaveLength(0);
    });

    it('should return friend list with correct accounts', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());
      const user3 = await accountService.createAccount('test_user3_' + Date.now());

      // Create friendships
      const request1 = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request1.requestId);

      const request2 = await friendService.sendFriendRequest(user1.accountId, user3.accountId);
      await friendService.acceptFriendRequest(request2.requestId);

      // Get friend list
      const friends = await friendService.getFriendList(user1.accountId);

      expect(friends).toHaveLength(2);
      const friendIds = friends.map(f => f.accountId);
      expect(friendIds).toContain(user2.accountId);
      expect(friendIds).toContain(user3.accountId);
    });

    it('should return bidirectional friend list', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request.requestId);

      // Both users should see each other in friend list
      const friends1 = await friendService.getFriendList(user1.accountId);
      const friends2 = await friendService.getFriendList(user2.accountId);

      expect(friends1).toHaveLength(1);
      expect(friends1[0].accountId).toBe(user2.accountId);
      expect(friends2).toHaveLength(1);
      expect(friends2[0].accountId).toBe(user1.accountId);
    });
  });

  describe('Test remove friend', () => {
    it('should remove friend successfully', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request.requestId);

      // Remove friend
      await friendService.removeFriend(user1.accountId, user2.accountId);

      // Verify friendship removed for both users
      const friends1 = await friendService.getFriendList(user1.accountId);
      const friends2 = await friendService.getFriendList(user2.accountId);

      expect(friends1).toHaveLength(0);
      expect(friends2).toHaveLength(0);
    });

    it('should throw error when removing non-existent friend', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      await expect(friendService.removeFriend(user1.accountId, user2.accountId))
        .rejects
        .toThrow('Friendship not found');
    });

    it('should allow removing friend from either side', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request.requestId);

      // Remove from user2's side
      await friendService.removeFriend(user2.accountId, user1.accountId);

      // Verify friendship removed for both
      const friends1 = await friendService.getFriendList(user1.accountId);
      const friends2 = await friendService.getFriendList(user2.accountId);

      expect(friends1).toHaveLength(0);
      expect(friends2).toHaveLength(0);
    });
  });
});
