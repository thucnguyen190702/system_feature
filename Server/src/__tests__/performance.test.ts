import { FriendService } from '../services/FriendService';
import { AccountService } from '../services/AccountService';
import { AppDataSource } from '../config/database';
import { InGameAccount } from '../entities/InGameAccount';
import { FriendRequest } from '../entities/FriendRequest';
import { FriendRelationship } from '../entities/FriendRelationship';

describe('Performance Testing', () => {
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
    await friendRelationshipRepository.query('DELETE FROM friend_relationships WHERE account_id1 IN (SELECT account_id FROM accounts WHERE username LIKE $1)', ['perf_test_%']);
    await friendRequestRepository.query('DELETE FROM friend_requests WHERE from_account_id IN (SELECT account_id FROM accounts WHERE username LIKE $1)', ['perf_test_%']);
    await accountRepository.query('DELETE FROM accounts WHERE username LIKE $1', ['perf_test_%']);
  });

  describe('23.1 Test friend list load time', () => {
    it('should load friend list in less than 2 seconds', async () => {
      // Create test user
      const user = await accountService.createAccount('perf_test_user_' + Date.now());

      // Create 50 friends for the user
      const friends: InGameAccount[] = [];
      for (let i = 0; i < 50; i++) {
        const friend = await accountService.createAccount(`perf_test_friend_${i}_${Date.now()}`);
        friends.push(friend);
        
        const request = await friendService.sendFriendRequest(user.accountId, friend.accountId);
        await friendService.acceptFriendRequest(request.requestId);
      }

      // Measure friend list load time
      const startTime = Date.now();
      const friendList = await friendService.getFriendList(user.accountId);
      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Verify load time is less than 2 seconds (2000ms)
      expect(loadTime).toBeLessThan(2000);
      expect(friendList).toHaveLength(50);

      console.log(`✅ Friend list load time: ${loadTime}ms (requirement: < 2000ms)`);
    }, 60000); // Increase timeout for this test

    it('should load friend list with 100 friends in less than 2 seconds', async () => {
      // Create test user
      const user = await accountService.createAccount('perf_test_user_large_' + Date.now());

      // Create 100 friends for the user
      const friends: InGameAccount[] = [];
      for (let i = 0; i < 100; i++) {
        const friend = await accountService.createAccount(`perf_test_friend_large_${i}_${Date.now()}`);
        friends.push(friend);
        
        const request = await friendService.sendFriendRequest(user.accountId, friend.accountId);
        await friendService.acceptFriendRequest(request.requestId);
      }

      // Measure friend list load time
      const startTime = Date.now();
      const friendList = await friendService.getFriendList(user.accountId);
      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Verify load time is less than 2 seconds (2000ms)
      expect(loadTime).toBeLessThan(2000);
      expect(friendList).toHaveLength(100);

      console.log(`✅ Friend list load time (100 friends): ${loadTime}ms (requirement: < 2000ms)`);
    }, 120000); // Increase timeout for this test
  });

  describe('23.2 Test friend request processing time', () => {
    it('should process friend request in less than 1 second', async () => {
      const user1 = await accountService.createAccount('perf_test_sender_' + Date.now());
      const user2 = await accountService.createAccount('perf_test_receiver_' + Date.now());

      // Measure send friend request time
      const startTime = Date.now();
      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify processing time is less than 1 second (1000ms)
      expect(processingTime).toBeLessThan(1000);
      expect(request).toBeDefined();
      expect(request.status).toBe('pending');

      console.log(`✅ Friend request processing time: ${processingTime}ms (requirement: < 1000ms)`);
    });

    it('should accept friend request in less than 1 second', async () => {
      const user1 = await accountService.createAccount('perf_test_sender_accept_' + Date.now());
      const user2 = await accountService.createAccount('perf_test_receiver_accept_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);

      // Measure accept friend request time
      const startTime = Date.now();
      await friendService.acceptFriendRequest(request.requestId);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify processing time is less than 1 second (1000ms)
      expect(processingTime).toBeLessThan(1000);

      // Verify friendship created
      const friends = await friendService.getFriendList(user1.accountId);
      expect(friends).toHaveLength(1);

      console.log(`✅ Accept friend request processing time: ${processingTime}ms (requirement: < 1000ms)`);
    });

    it('should remove friend in less than 1 second', async () => {
      const user1 = await accountService.createAccount('perf_test_remove_1_' + Date.now());
      const user2 = await accountService.createAccount('perf_test_remove_2_' + Date.now());

      const request = await friendService.sendFriendRequest(user1.accountId, user2.accountId);
      await friendService.acceptFriendRequest(request.requestId);

      // Measure remove friend time
      const startTime = Date.now();
      await friendService.removeFriend(user1.accountId, user2.accountId);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify processing time is less than 1 second (1000ms)
      expect(processingTime).toBeLessThan(1000);

      // Verify friendship removed
      const friends = await friendService.getFriendList(user1.accountId);
      expect(friends).toHaveLength(0);

      console.log(`✅ Remove friend processing time: ${processingTime}ms (requirement: < 1000ms)`);
    });
  });

  describe('23.3 Test concurrent requests', () => {
    it('should handle 100 concurrent friend requests', async () => {
      // Create sender account
      const sender = await accountService.createAccount('perf_test_concurrent_sender_' + Date.now());

      // Create 100 receiver accounts
      const receivers: InGameAccount[] = [];
      for (let i = 0; i < 100; i++) {
        const receiver = await accountService.createAccount(`perf_test_concurrent_receiver_${i}_${Date.now()}`);
        receivers.push(receiver);
      }

      // Send 100 concurrent friend requests
      const startTime = Date.now();
      const promises = receivers.map(receiver => 
        friendService.sendFriendRequest(sender.accountId, receiver.accountId)
      );
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all requests were created
      expect(results).toHaveLength(100);
      results.forEach(request => {
        expect(request.status).toBe('pending');
      });

      console.log(`✅ 100 concurrent friend requests processed in ${totalTime}ms`);
    }, 120000);

    it('should handle 50 concurrent friend list queries', async () => {
      // Create 50 users with friends
      const users: InGameAccount[] = [];
      for (let i = 0; i < 50; i++) {
        const user = await accountService.createAccount(`perf_test_query_user_${i}_${Date.now()}`);
        users.push(user);

        // Give each user 5 friends
        for (let j = 0; j < 5; j++) {
          const friend = await accountService.createAccount(`perf_test_query_friend_${i}_${j}_${Date.now()}`);
          const request = await friendService.sendFriendRequest(user.accountId, friend.accountId);
          await friendService.acceptFriendRequest(request.requestId);
        }
      }

      // Query friend lists concurrently
      const startTime = Date.now();
      const promises = users.map(user => 
        friendService.getFriendList(user.accountId)
      );
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all queries returned correct results
      expect(results).toHaveLength(50);
      results.forEach(friendList => {
        expect(friendList).toHaveLength(5);
      });

      console.log(`✅ 50 concurrent friend list queries processed in ${totalTime}ms`);
    }, 180000);

    it('should handle mixed concurrent operations', async () => {
      // Create test accounts
      const users: InGameAccount[] = [];
      for (let i = 0; i < 30; i++) {
        const user = await accountService.createAccount(`perf_test_mixed_user_${i}_${Date.now()}`);
        users.push(user);
      }

      // Prepare mixed operations
      const operations: Promise<any>[] = [];

      // 10 friend requests
      for (let i = 0; i < 10; i++) {
        operations.push(
          friendService.sendFriendRequest(users[i].accountId, users[i + 10].accountId)
        );
      }

      // 10 friend list queries
      for (let i = 0; i < 10; i++) {
        operations.push(
          friendService.getFriendList(users[i].accountId)
        );
      }

      // 10 account creations
      for (let i = 0; i < 10; i++) {
        operations.push(
          accountService.createAccount(`perf_test_mixed_new_${i}_${Date.now()}`)
        );
      }

      // Execute all operations concurrently
      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all operations completed
      expect(results).toHaveLength(30);

      console.log(`✅ 30 mixed concurrent operations processed in ${totalTime}ms`);
    }, 120000);
  });
});
