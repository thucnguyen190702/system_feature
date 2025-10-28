# Tài liệu Thiết kế - Hệ thống Bạn bè

## Tổng quan

Hệ thống Bạn bè (Friend System) là một module xã hội cho phép người chơi (Player) kết nối và tương tác với nhau thông qua tài khoản trong game (In-game Account). Hệ thống cung cấp các chức năng tìm kiếm, quản lý danh sách bạn bè (Friend List), và gửi lời mời kết bạn (Friend Request).

## Kiến trúc

### Kiến trúc Tổng thể

Hệ thống sử dụng kiến trúc Client-Server với các thành phần sau:

```
┌──────────────────────────┐
│   Unity Client (C#)      │
│   - UI Components        │
│   - Friend Manager       │
│   - API Client           │
└────────────┬─────────────┘
             │ HTTPS/REST
             │
┌────────────▼─────────────┐
│  Node.js Server (TS)     │
│   - Express.js           │
│   - REST API Endpoints   │
│   - Business Logic       │
│   - Authentication       │
└────────────┬─────────────┘
             │ SQL
             │
┌────────────▼─────────────┐
│  PostgreSQL Database     │
│   - Accounts Table       │
│   - Friends Table        │
│   - Requests Table       │
└──────────────────────────┘
```

### Tech Stack

**Client Side (Unity C#)**:
- Unity 2021.3 LTS hoặc mới hơn
- .NET Standard 2.1
- UniTask cho async operations
- Newtonsoft.Json cho JSON serialization
- UnityWebRequest cho HTTP calls

**Server Side (Node.js TypeScript)**:
- Node.js 18+ LTS
- TypeScript 5.0+
- Express.js 4.x cho REST API
- TypeORM cho database ORM
- JWT cho authentication
- bcrypt cho password hashing
- class-validator cho validation
- Redis cho caching (optional)

**Database (PostgreSQL)**:
- PostgreSQL 14+
- pg driver cho Node.js
- Connection pooling
- Migrations với TypeORM

### Các Lớp Chính

1. **Unity Client Layer**: 
   - UI Components (UGUI/UI Toolkit)
   - Manager Classes (C#)
   - API Client Service
   - Local Data Cache

2. **Node.js Server Layer**:
   - Express Routes
   - Controllers
   - Services (Business Logic)
   - Middleware (Auth, Validation)
   - Database Repositories

3. **PostgreSQL Data Layer**:
   - Tables với relationships
   - Indexes cho performance
   - Stored procedures (nếu cần)
   - Backup và replication

## Thành phần và Giao diện

### Unity Client (C#)

#### 1. Account Manager
```csharp
public class AccountManager : MonoBehaviour
{
    private static AccountManager _instance;
    public static AccountManager Instance => _instance;
    
    private InGameAccount _currentAccount;
    private ApiClient _apiClient;
    
    public async UniTask<InGameAccount> CreateAccount(string username)
    {
        var response = await _apiClient.PostAsync<InGameAccount>("/api/accounts", new { username });
        _currentAccount = response;
        return response;
    }
    
    public async UniTask<InGameAccount> GetAccount(string accountId)
    {
        return await _apiClient.GetAsync<InGameAccount>($"/api/accounts/{accountId}");
    }
    
    public async UniTask<InGameAccount> UpdateAccount(string accountId, AccountUpdateData data)
    {
        return await _apiClient.PutAsync<InGameAccount>($"/api/accounts/{accountId}", data);
    }
}
```

#### 2. Friend Manager
```csharp
public class FriendManager : MonoBehaviour
{
    private static FriendManager _instance;
    public static FriendManager Instance => _instance;
    
    private List<InGameAccount> _friendList = new List<InGameAccount>();
    private ApiClient _apiClient;
    
    public async UniTask<List<InGameAccount>> GetFriendList(string accountId)
    {
        _friendList = await _apiClient.GetAsync<List<InGameAccount>>($"/api/friends/{accountId}");
        return _friendList;
    }
    
    public async UniTask<bool> SendFriendRequest(string toAccountId)
    {
        var response = await _apiClient.PostAsync<ApiResponse>("/api/friend-requests", new { toAccountId });
        return response.Success;
    }
    
    public async UniTask<bool> AcceptFriendRequest(string requestId)
    {
        var response = await _apiClient.PostAsync<ApiResponse>($"/api/friend-requests/{requestId}/accept", null);
        return response.Success;
    }
    
    public async UniTask<bool> RemoveFriend(string friendAccountId)
    {
        var response = await _apiClient.DeleteAsync<ApiResponse>($"/api/friends/{friendAccountId}");
        return response.Success;
    }
    
    public async UniTask<List<FriendRequest>> GetPendingRequests(string accountId)
    {
        return await _apiClient.GetAsync<List<FriendRequest>>($"/api/friend-requests/{accountId}/pending");
    }
    
    public async UniTask<bool> UpdateOnlineStatus(string accountId, bool isOnline)
    {
        var response = await _apiClient.PostAsync<ApiResponse>($"/api/friends/status", new { accountId, isOnline });
        return response.Success;
    }
    
    public async UniTask<Dictionary<string, bool>> GetFriendsOnlineStatus(List<string> accountIds)
    {
        var response = await _apiClient.PostAsync<Dictionary<string, bool>>($"/api/friends/status/batch", new { accountIds });
        return response;
    }
}
```

#### 3. Search Manager
```csharp
public class SearchManager : MonoBehaviour
{
    private static SearchManager _instance;
    public static SearchManager Instance => _instance;
    
    private ApiClient _apiClient;
    
    public async UniTask<List<InGameAccount>> SearchByUsername(string username)
    {
        return await _apiClient.GetAsync<List<InGameAccount>>($"/api/search/username?q={username}");
    }
    
    public async UniTask<InGameAccount> SearchById(string accountId)
    {
        return await _apiClient.GetAsync<InGameAccount>($"/api/search/id/{accountId}");
    }
}
```

#### 4. API Client
```csharp
public class ApiClient
{
    private string _baseUrl;
    private string _authToken;
    
    public async UniTask<T> GetAsync<T>(string endpoint)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(_baseUrl + endpoint))
        {
            request.SetRequestHeader("Authorization", $"Bearer {_authToken}");
            await request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                return JsonConvert.DeserializeObject<T>(request.downloadHandler.text);
            }
            throw new Exception($"API Error: {request.error}");
        }
    }
    
    public async UniTask<T> PostAsync<T>(string endpoint, object data)
    {
        string json = JsonConvert.SerializeObject(data);
        using (UnityWebRequest request = UnityWebRequest.Post(_baseUrl + endpoint, json, "application/json"))
        {
            request.SetRequestHeader("Authorization", $"Bearer {_authToken}");
            await request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                return JsonConvert.DeserializeObject<T>(request.downloadHandler.text);
            }
            throw new Exception($"API Error: {request.error}");
        }
    }
    
    public async UniTask<T> DeleteAsync<T>(string endpoint)
    {
        using (UnityWebRequest request = UnityWebRequest.Delete(_baseUrl + endpoint))
        {
            request.SetRequestHeader("Authorization", $"Bearer {_authToken}");
            await request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                return JsonConvert.DeserializeObject<T>(request.downloadHandler.text);
            }
            throw new Exception($"API Error: {request.error}");
        }
    }
}
```

### Node.js Server (TypeScript)

#### 1. Account Controller
```typescript
import { Request, Response } from 'express';
import { AccountService } from '../services/AccountService';

export class AccountController {
    private accountService: AccountService;
    
    constructor() {
        this.accountService = new AccountService();
    }
    
    async createAccount(req: Request, res: Response) {
        try {
            const { username } = req.body;
            const account = await this.accountService.createAccount(username);
            res.status(201).json(account);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    
    async getAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const account = await this.accountService.getAccount(accountId);
            res.json(account);
        } catch (error) {
            res.status(404).json({ error: 'Account not found' });
        }
    }
    
    async updateAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const updateData = req.body;
            const account = await this.accountService.updateAccount(accountId, updateData);
            res.json(account);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
```

#### 2. Friend Controller
```typescript
import { Request, Response } from 'express';
import { FriendService } from '../services/FriendService';

export class FriendController {
    private friendService: FriendService;
    
    constructor() {
        this.friendService = new FriendService();
    }
    
    async getFriendList(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const friends = await this.friendService.getFriendList(accountId);
            res.json(friends);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async sendFriendRequest(req: Request, res: Response) {
        try {
            const { fromAccountId } = req.user;
            const { toAccountId } = req.body;
            const result = await this.friendService.sendFriendRequest(fromAccountId, toAccountId);
            res.json({ success: true, requestId: result.id });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    
    async acceptFriendRequest(req: Request, res: Response) {
        try {
            const { requestId } = req.params;
            await this.friendService.acceptFriendRequest(requestId);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    
    async removeFriend(req: Request, res: Response) {
        try {
            const { accountId } = req.user;
            const { friendAccountId } = req.params;
            await this.friendService.removeFriend(accountId, friendAccountId);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    
    async getPendingRequests(req: Request, res: Response) {
        try {
            const { accountId } = req.params;
            const requests = await this.friendService.getPendingRequests(accountId);
            res.json(requests);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async updateOnlineStatus(req: Request, res: Response) {
        try {
            const { accountId, isOnline } = req.body;
            await this.friendService.updateOnlineStatus(accountId, isOnline);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    async getFriendsOnlineStatus(req: Request, res: Response) {
        try {
            const { accountIds } = req.body;
            const statuses = await this.friendService.getFriendsOnlineStatus(accountIds);
            res.json(statuses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
```

#### 3. Account Service
```typescript
import { Repository } from 'typeorm';
import { InGameAccount } from '../entities/InGameAccount';
import { v4 as uuidv4 } from 'uuid';

export class AccountService {
    private accountRepository: Repository<InGameAccount>;
    
    async createAccount(username: string): Promise<InGameAccount> {
        const existingAccount = await this.accountRepository.findOne({ where: { username } });
        if (existingAccount) {
            throw new Error('Username already exists');
        }
        
        const account = this.accountRepository.create({
            accountId: uuidv4(),
            username,
            displayName: username,
            level: 1,
            status: 'active'
        });
        
        return await this.accountRepository.save(account);
    }
    
    async getAccount(accountId: string): Promise<InGameAccount> {
        const account = await this.accountRepository.findOne({ where: { accountId } });
        if (!account) {
            throw new Error('Account not found');
        }
        return account;
    }
    
    async updateAccount(accountId: string, updateData: Partial<InGameAccount>): Promise<InGameAccount> {
        const account = await this.getAccount(accountId);
        Object.assign(account, updateData);
        return await this.accountRepository.save(account);
    }
}
```

#### 4. Friend Service
```typescript
import { Repository } from 'typeorm';
import { FriendRequest } from '../entities/FriendRequest';
import { FriendRelationship } from '../entities/FriendRelationship';
import { InGameAccount } from '../entities/InGameAccount';
import { v4 as uuidv4 } from 'uuid';

export class FriendService {
    private friendRequestRepository: Repository<FriendRequest>;
    private friendRelationshipRepository: Repository<FriendRelationship>;
    private accountRepository: Repository<InGameAccount>;
    
    async getFriendList(accountId: string): Promise<InGameAccount[]> {
        const relationships = await this.friendRelationshipRepository.find({
            where: [
                { accountId1: accountId },
                { accountId2: accountId }
            ],
            relations: ['account1', 'account2']
        });
        
        return relationships.map(rel => 
            rel.accountId1 === accountId ? rel.account2 : rel.account1
        );
    }
    
    async sendFriendRequest(fromAccountId: string, toAccountId: string): Promise<FriendRequest> {
        // Check if already friends
        const existingRelationship = await this.friendRelationshipRepository.findOne({
            where: [
                { accountId1: fromAccountId, accountId2: toAccountId },
                { accountId1: toAccountId, accountId2: fromAccountId }
            ]
        });
        
        if (existingRelationship) {
            throw new Error('Already friends');
        }
        
        // Check for existing pending request
        const existingRequest = await this.friendRequestRepository.findOne({
            where: {
                fromAccountId,
                toAccountId,
                status: 'pending'
            }
        });
        
        if (existingRequest) {
            throw new Error('Friend request already sent');
        }
        
        const request = this.friendRequestRepository.create({
            requestId: uuidv4(),
            fromAccountId,
            toAccountId,
            status: 'pending'
        });
        
        return await this.friendRequestRepository.save(request);
    }
    
    async acceptFriendRequest(requestId: string): Promise<void> {
        const request = await this.friendRequestRepository.findOne({ where: { requestId } });
        if (!request || request.status !== 'pending') {
            throw new Error('Invalid friend request');
        }
        
        // Create bidirectional friendship
        const relationship = this.friendRelationshipRepository.create({
            relationshipId: uuidv4(),
            accountId1: request.fromAccountId,
            accountId2: request.toAccountId
        });
        
        await this.friendRelationshipRepository.save(relationship);
        
        // Update request status
        request.status = 'accepted';
        await this.friendRequestRepository.save(request);
    }
    
    async removeFriend(accountId: string, friendAccountId: string): Promise<void> {
        const relationship = await this.friendRelationshipRepository.findOne({
            where: [
                { accountId1: accountId, accountId2: friendAccountId },
                { accountId1: friendAccountId, accountId2: accountId }
            ]
        });
        
        if (!relationship) {
            throw new Error('Not friends');
        }
        
        await this.friendRelationshipRepository.remove(relationship);
    }
    
    async getPendingRequests(accountId: string): Promise<FriendRequest[]> {
        return await this.friendRequestRepository.find({
            where: {
                toAccountId: accountId,
                status: 'pending'
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }
    
    async updateOnlineStatus(accountId: string, isOnline: boolean): Promise<void> {
        const account = await this.accountRepository.findOne({ where: { accountId } });
        if (!account) {
            throw new Error('Account not found');
        }
        
        account.isOnline = isOnline;
        account.lastSeenAt = new Date();
        await this.accountRepository.save(account);
    }
    
    async getFriendsOnlineStatus(accountIds: string[]): Promise<Record<string, boolean>> {
        const accounts = await this.accountRepository.find({
            where: accountIds.map(id => ({ accountId: id })),
            select: ['accountId', 'isOnline']
        });
        
        const statusMap: Record<string, boolean> = {};
        accounts.forEach(account => {
            statusMap[account.accountId] = account.isOnline;
        });
        
        return statusMap;
    }
}
```

### PostgreSQL Database Schema

#### 1. Accounts Table
```sql
CREATE TABLE accounts (
    account_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    level INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_username ON accounts(username);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_is_online ON accounts(is_online);
```

#### 2. Friend Requests Table
```sql
CREATE TABLE friend_requests (
    request_id VARCHAR(36) PRIMARY KEY,
    from_account_id VARCHAR(36) NOT NULL,
    to_account_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE INDEX idx_friend_requests_from ON friend_requests(from_account_id);
CREATE INDEX idx_friend_requests_to ON friend_requests(to_account_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);
```

#### 3. Friend Relationships Table
```sql
CREATE TABLE friend_relationships (
    relationship_id VARCHAR(36) PRIMARY KEY,
    account_id1 VARCHAR(36) NOT NULL,
    account_id2 VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id1) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id2) REFERENCES accounts(account_id) ON DELETE CASCADE,
    UNIQUE(account_id1, account_id2)
);

CREATE INDEX idx_friend_relationships_account1 ON friend_relationships(account_id1);
CREATE INDEX idx_friend_relationships_account2 ON friend_relationships(account_id2);
```

## Mô hình Dữ liệu

### Unity C# Models

```csharp
[Serializable]
public class InGameAccount
{
    public string AccountId;
    public string Username;
    public string DisplayName;
    public string AvatarUrl;
    public int Level;
    public string Status;
    public bool IsOnline;
    public DateTime LastSeenAt;
    public DateTime CreatedAt;
    public DateTime UpdatedAt;
}

[Serializable]
public class FriendRequest
{
    public string RequestId;
    public string FromAccountId;
    public string ToAccountId;
    public string Status;
    public DateTime CreatedAt;
}

[Serializable]
public class ApiResponse
{
    public bool Success;
    public string Message;
}
```

### TypeScript Entities

```typescript
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('accounts')
export class InGameAccount {
    @PrimaryColumn({ name: 'account_id' })
    accountId: string;
    
    @Column({ unique: true })
    username: string;
    
    @Column({ name: 'display_name' })
    displayName: string;
    
    @Column({ name: 'avatar_url', nullable: true })
    avatarUrl: string;
    
    @Column({ default: 1 })
    level: number;
    
    @Column({ default: 'active' })
    status: string;
    
    @Column({ name: 'is_online', default: false })
    isOnline: boolean;
    
    @Column({ name: 'last_seen_at', nullable: true })
    lastSeenAt: Date;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('friend_requests')
export class FriendRequest {
    @PrimaryColumn({ name: 'request_id' })
    requestId: string;
    
    @Column({ name: 'from_account_id' })
    fromAccountId: string;
    
    @Column({ name: 'to_account_id' })
    toAccountId: string;
    
    @Column({ default: 'pending' })
    status: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

@Entity('friend_relationships')
export class FriendRelationship {
    @PrimaryColumn({ name: 'relationship_id' })
    relationshipId: string;
    
    @Column({ name: 'account_id1' })
    accountId1: string;
    
    @Column({ name: 'account_id2' })
    accountId2: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
```

## API Endpoints

### Account Endpoints
- `POST /api/accounts` - Tạo tài khoản mới
- `GET /api/accounts/:accountId` - Lấy thông tin tài khoản
- `PUT /api/accounts/:accountId` - Cập nhật tài khoản
- `DELETE /api/accounts/:accountId` - Xóa tài khoản

### Friend Endpoints
- `GET /api/friends/:accountId` - Lấy danh sách bạn bè
- `DELETE /api/friends/:friendAccountId` - Xóa bạn bè

### Friend Request Endpoints
- `POST /api/friend-requests` - Gửi lời mời kết bạn
- `GET /api/friend-requests/:accountId/pending` - Lấy danh sách lời mời đang chờ
- `POST /api/friend-requests/:requestId/accept` - Chấp nhận lời mời
- `POST /api/friend-requests/:requestId/reject` - Từ chối lời mời

### Friend Status Endpoints
- `POST /api/friends/status` - Cập nhật trạng thái online/offline
- `POST /api/friends/status/batch` - Lấy trạng thái online của nhiều bạn bè

### Search Endpoints
- `GET /api/search/username?q=:query` - Tìm kiếm theo username
- `GET /api/search/id/:accountId` - Tìm kiếm theo ID

## Xử lý Lỗi

### Unity Client Error Handling
```csharp
public class ErrorHandler
{
    public static void HandleApiError(Exception ex)
    {
        if (ex is UnityWebRequestException webEx)
        {
            switch (webEx.ResponseCode)
            {
                case 400:
                    ShowError("Yêu cầu không hợp lệ");
                    break;
                case 401:
                    ShowError("Phiên đăng nhập hết hạn");
                    break;
                case 404:
                    ShowError("Không tìm thấy");
                    break;
                case 500:
                    ShowError("Lỗi server");
                    break;
                default:
                    ShowError("Đã xảy ra lỗi");
                    break;
            }
        }
    }
}
```

### Node.js Error Middleware
```typescript
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
}
```

## Bảo mật

### JWT Authentication
```typescript
import jwt from 'jsonwebtoken';

export function generateToken(accountId: string): string {
    return jwt.sign({ accountId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}
```

### Data Encryption
```typescript
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
```

## Tối ưu Hiệu suất

### Caching với Redis (Optional)
```typescript
import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
});

export async function getCachedFriendList(accountId: string): Promise<InGameAccount[] | null> {
    const cached = await redis.get(`friends:${accountId}`);
    return cached ? JSON.parse(cached) : null;
}

export async function cacheFriendList(accountId: string, friends: InGameAccount[]): Promise<void> {
    await redis.setex(`friends:${accountId}`, 300, JSON.stringify(friends));
}
```

### Database Connection Pooling
```typescript
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [InGameAccount, FriendRequest, FriendRelationship],
    synchronize: false,
    logging: false,
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000
    }
});
```

## Chiến lược Kiểm thử

### Unity Tests
```csharp
[Test]
public async Task TestSendFriendRequest()
{
    var friendManager = new FriendManager();
    var result = await friendManager.SendFriendRequest("account-123");
    Assert.IsTrue(result);
}

[Test]
public async Task TestGetFriendList()
{
    var friendManager = new FriendManager();
    var friends = await friendManager.GetFriendList("account-123");
    Assert.IsNotNull(friends);
}
```

### Node.js Tests
```typescript
import { expect } from 'chai';
import { AccountService } from '../services/AccountService';
import { FriendService } from '../services/FriendService';

describe('AccountService', () => {
    it('should create account successfully', async () => {
        const service = new AccountService();
        const account = await service.createAccount('testuser');
        expect(account.username).to.equal('testuser');
    });
});

describe('FriendService', () => {
    it('should send friend request successfully', async () => {
        const service = new FriendService();
        const request = await service.sendFriendRequest('account-1', 'account-2');
        expect(request.status).to.equal('pending');
    });
});
```

## Monitoring và Logging

### Winston Logger
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Usage
logger.info('Friend request sent', { fromAccountId, toAccountId });
logger.error('Failed to accept friend request', { error: error.message });
```

### Metrics Collection
```typescript
import { Counter, Histogram } from 'prom-client';

const friendRequestCounter = new Counter({
    name: 'friend_requests_total',
    help: 'Total number of friend requests'
});

const apiResponseTime = new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds'
});
```
