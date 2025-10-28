import { FriendService } from '../services/FriendService';
import { AccountService } from '../services/AccountService';
import { AppDataSource } from '../config/database';
import { InGameAccount } from '../entities/InGameAccount';
import { FriendRequest } from '../entities/FriendRequest';
import { FriendRelationship } from '../entities/FriendRelationship';

describe('Friend Request Flow - Integration Tests', () => {
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

  describe('Test send friend request', () => {
    it('should send friend request successfully', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);

      expect(request).toBeDefined();
      expect(request.requestId).toBeDefined();
      expect(request.fromAccountId).toBe(user1.accountId);
      expect(request.toAccountId).toBe(user2.accountId);
      expect(request.status).toBe('pending');
    });

    it('should throw error when sender account does not exist', async () => {
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      await expect(friendService.sendFriendRequest('non-existent-id', user2.accountId))
        .rejects
        .toThrow('Sender account not found');
    });

    it('should throw error when recipient account does not exist', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());

      await expect(friendService.sendFriendRequest(user1.accountId, 'non-existent-id'))
        .rejects
        .toThrow('Recipient account not found');
    });

    it('should throw error when sending request to self', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());

      await expect(friendService.sendFriendRequest(user1.accountId, user1.accountId))
        .rejects
        .toThrow('Cannot send friend request to yourself');
    });
  });

  describe('Test accept friend request', () => {
    it('should accept friend request and create bidirectional relationship', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request.requestId);

      // Verify request status updated
      const updatedRequest = await friendRequestRepository.findOne({ 
        where: { requestId: request.requestId } 
      });
      expect(updatedRequest.status).toBe('accepted');

      // Verify friendship created
      const friends1 = await friendService.getFriendList(user1.accountId);
      const friends2 = await friendService.getFriendList(user2.accountId);

      expect(friends1).toHaveLength(1);
      expect(friends1[0].accountId).toBe(user2.accountId);
      expect(friends2).toHaveLength(1);
      expect(friends2[0].accountId).toBe(user1.accountId);
    });

    it('should throw error when accepting non-existent request', async () => {
      await expect(friendService.acceptFriendRequest('non-existent-id'))
        .rejects
        .toThrow('Friend request not found');
    });

    it('should throw error when accepting already accepted request', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request.requestId);

      // Try to accept again
      await expect(friendService.acceptFriendRequest(request.requestId))
        .rejects
        .toThrow('Friend request is not pending');
    });
  });

  describe('Test duplicate request prevention', () => {
    it('should throw error when sending duplicate friend request', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      await friendService.sendFriendRequest(user1.accountId, user2.accountId);

      // Try to send again
      await expect(friendService.sendFriendRequest(user1.accountId, user2.accountId))
        .rejects
        .toThrow('Friend request already pending');
    });

    it('should throw error when sending request to existing friend', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request.requestId);

      // Try to send request again
      await expect(friendService.sendFriendRequest(user1.accountId, user2.accountId))
        .rejects
        .toThrow('Already friends');
    });

    it('should throw error when reverse request already pending', async () => {
      const user1 = await accountService.createAccount('test_user1_' + Date.now());
      const user2 = await accountService.createAccount('test_user2_' + Date.now());

      await friendService.sendFriendRequest(user1.accountId, user2.accountId);

      // Try to send reverse request
      await expect(friendService.sendFriendRequest(user2.accountId, user1.accountId))
        .rejects
        .toThrow('Friend request already pending');
    });
  });
});
