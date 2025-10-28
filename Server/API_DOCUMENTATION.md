# Friend System API Documentation

## Overview

This document provides comprehensive documentation for the Friend System REST API. The API enables players to manage in-game accounts, friend relationships, friend requests, and search functionality.

**Base URL**: `http://localhost:3000/api`

**Authentication**: All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Table of Contents

1. [Account Endpoints](#account-endpoints)
2. [Friend Endpoints](#friend-endpoints)
3. [Friend Request Endpoints](#friend-request-endpoints)
4. [Search Endpoints](#search-endpoints)
5. [Block Endpoints](#block-endpoints)
6. [Error Responses](#error-responses)
7. [Rate Limiting](#rate-limiting)

---

## Account Endpoints

### Create Account

Creates a new in-game account.

**Endpoint**: `POST /api/accounts`

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "player123",
  "displayName": "Player One",
  "avatarUrl": "https://example.com/avatar.png"
}
```

**Response** (201 Created):
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player123",
  "displayName": "Player One",
  "avatarUrl": "https://example.com/avatar.png",
  "level": 1,
  "status": "active",
  "isOnline": false,
  "lastSeenAt": null,
  "createdAt": "2025-10-28T10:00:00.000Z",
  "updatedAt": "2025-10-28T10:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Username already exists or invalid data
- `500 Internal Server Error`: Server error

---

### Get Account

Retrieves account information by account ID.

**Endpoint**: `GET /api/accounts/:accountId`

**Authentication**: Required

**Path Parameters**:
- `accountId` (string): The unique account identifier

**Response** (200 OK):
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player123",
  "displayName": "Player One",
  "avatarUrl": "https://example.com/avatar.png",
  "level": 5,
  "status": "active",
  "isOnline": true,
  "lastSeenAt": "2025-10-28T10:30:00.000Z",
  "createdAt": "2025-10-28T10:00:00.000Z",
  "updatedAt": "2025-10-28T10:30:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

### Update Account

Updates account information.

**Endpoint**: `PUT /api/accounts/:accountId`

**Authentication**: Required

**Path Parameters**:
- `accountId` (string): The unique account identifier

**Request Body**:
```json
{
  "displayName": "Updated Name",
  "avatarUrl": "https://example.com/new-avatar.png",
  "level": 10
}
```

**Response** (200 OK):
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player123",
  "displayName": "Updated Name",
  "avatarUrl": "https://example.com/new-avatar.png",
  "level": 10,
  "status": "active",
  "isOnline": true,
  "lastSeenAt": "2025-10-28T10:30:00.000Z",
  "createdAt": "2025-10-28T10:00:00.000Z",
  "updatedAt": "2025-10-28T11:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid update data
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

## Friend Endpoints

### Get Friend List

Retrieves the list of friends for an account.

**Endpoint**: `GET /api/friends/:accountId`

**Authentication**: Required

**Path Parameters**:
- `accountId` (string): The unique account identifier

**Response** (200 OK):
```json
[
  {
    "accountId": "660e8400-e29b-41d4-a716-446655440001",
    "username": "friend1",
    "displayName": "Friend One",
    "avatarUrl": "https://example.com/friend1.png",
    "level": 8,
    "status": "active",
    "isOnline": true,
    "lastSeenAt": "2025-10-28T11:00:00.000Z"
  },
  {
    "accountId": "770e8400-e29b-41d4-a716-446655440002",
    "username": "friend2",
    "displayName": "Friend Two",
    "avatarUrl": "https://example.com/friend2.png",
    "level": 12,
    "status": "active",
    "isOnline": false,
    "lastSeenAt": "2025-10-27T15:30:00.000Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

### Remove Friend

Removes a friend from the friend list.

**Endpoint**: `DELETE /api/friends/:friendAccountId`

**Authentication**: Required

**Path Parameters**:
- `friendAccountId` (string): The account ID of the friend to remove

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Not friends or invalid request
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Friend account not found
- `500 Internal Server Error`: Server error

---

### Update Online Status

Updates the online status of an account.

**Endpoint**: `POST /api/friends/status`

**Authentication**: Required

**Request Body**:
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "isOnline": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Online status updated"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

### Get Friends Online Status (Batch)

Retrieves online status for multiple friends.

**Endpoint**: `POST /api/friends/status/batch`

**Authentication**: Required

**Request Body**:
```json
{
  "accountIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002",
    "880e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**Response** (200 OK):
```json
{
  "660e8400-e29b-41d4-a716-446655440001": true,
  "770e8400-e29b-41d4-a716-446655440002": false,
  "880e8400-e29b-41d4-a716-446655440003": true
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

## Friend Request Endpoints

### Send Friend Request

Sends a friend request to another account.

**Endpoint**: `POST /api/friend-requests`

**Authentication**: Required

**Request Body**:
```json
{
  "toAccountId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "requestId": "990e8400-e29b-41d4-a716-446655440010",
  "message": "Friend request sent successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Already friends, request already sent, or blocked
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Target account not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### Get Pending Friend Requests

Retrieves all pending friend requests for an account.

**Endpoint**: `GET /api/friend-requests/:accountId/pending`

**Authentication**: Required

**Path Parameters**:
- `accountId` (string): The unique account identifier

**Response** (200 OK):
```json
[
  {
    "requestId": "990e8400-e29b-41d4-a716-446655440010",
    "fromAccountId": "660e8400-e29b-41d4-a716-446655440001",
    "toAccountId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "createdAt": "2025-10-28T09:00:00.000Z",
    "fromAccount": {
      "accountId": "660e8400-e29b-41d4-a716-446655440001",
      "username": "sender123",
      "displayName": "Sender User",
      "avatarUrl": "https://example.com/sender.png",
      "level": 7
    }
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

### Accept Friend Request

Accepts a pending friend request.

**Endpoint**: `POST /api/friend-requests/:requestId/accept`

**Authentication**: Required

**Path Parameters**:
- `requestId` (string): The unique friend request identifier

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Friend request accepted"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request or already processed
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Request not found
- `500 Internal Server Error`: Server error

---

### Reject Friend Request

Rejects a pending friend request.

**Endpoint**: `POST /api/friend-requests/:requestId/reject`

**Authentication**: Required

**Path Parameters**:
- `requestId` (string): The unique friend request identifier

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Friend request rejected"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request or already processed
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Request not found
- `500 Internal Server Error`: Server error

---

## Search Endpoints

### Search by Username

Searches for accounts by username (partial match).

**Endpoint**: `GET /api/search/username`

**Authentication**: Required

**Query Parameters**:
- `q` (string): Search query (minimum 2 characters)

**Example**: `/api/search/username?q=player`

**Response** (200 OK):
```json
[
  {
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player123",
    "displayName": "Player One",
    "avatarUrl": "https://example.com/avatar.png",
    "level": 5,
    "isOnline": true
  },
  {
    "accountId": "660e8400-e29b-41d4-a716-446655440001",
    "username": "player456",
    "displayName": "Player Two",
    "avatarUrl": "https://example.com/avatar2.png",
    "level": 8,
    "isOnline": false
  }
]
```

**Error Responses**:
- `400 Bad Request`: Query too short or invalid
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### Search by Account ID

Searches for an account by exact account ID.

**Endpoint**: `GET /api/search/id/:accountId`

**Authentication**: Required

**Path Parameters**:
- `accountId` (string): The unique account identifier

**Response** (200 OK):
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player123",
  "displayName": "Player One",
  "avatarUrl": "https://example.com/avatar.png",
  "level": 5,
  "status": "active",
  "isOnline": true,
  "lastSeenAt": "2025-10-28T11:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

## Block Endpoints

### Block Account

Blocks another account from sending friend requests.

**Endpoint**: `POST /api/blocks`

**Authentication**: Required

**Request Body**:
```json
{
  "blockedAccountId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Account blocked successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Already blocked or invalid request
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

### Unblock Account

Unblocks a previously blocked account.

**Endpoint**: `DELETE /api/blocks/:blockedAccountId`

**Authentication**: Required

**Path Parameters**:
- `blockedAccountId` (string): The account ID to unblock

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account unblocked successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Account not blocked
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

### Get Blocked Accounts

Retrieves list of blocked accounts.

**Endpoint**: `GET /api/blocks/:accountId`

**Authentication**: Required

**Path Parameters**:
- `accountId` (string): The unique account identifier

**Response** (200 OK):
```json
[
  {
    "blockId": "aa0e8400-e29b-41d4-a716-446655440020",
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "blockedAccountId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2025-10-28T10:00:00.000Z",
    "blockedAccount": {
      "accountId": "660e8400-e29b-41d4-a716-446655440001",
      "username": "blocked_user",
      "displayName": "Blocked User"
    }
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Account not found
- `500 Internal Server Error`: Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or business logic violation
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Requested resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Friend Requests**: Maximum 10 requests per day per account
- **Search Requests**: Maximum 100 requests per hour per account
- **General API**: Maximum 1000 requests per hour per IP address

When rate limit is exceeded, the API returns:

**Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 3600
}
```

The `retryAfter` field indicates seconds until the limit resets.

---

## Authentication

### Obtaining a Token

Tokens are obtained during account creation or login. The token should be included in all subsequent requests.

**Example**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

Tokens expire after 7 days. When a token expires, the API returns a 401 Unauthorized response. The client should handle this by requesting a new token.

---

## Best Practices

1. **Always handle errors**: Check response status codes and handle errors appropriately
2. **Cache friend lists**: Friend lists can be cached for up to 5 minutes to reduce API calls
3. **Batch requests**: Use batch endpoints (like `/api/friends/status/batch`) when possible
4. **Respect rate limits**: Implement exponential backoff when rate limited
5. **Use HTTPS**: Always use HTTPS in production environments
6. **Validate input**: Validate all input data on the client side before sending requests

---

## Examples

### Complete Friend Request Flow

```javascript
// 1. Search for a user
const searchResults = await fetch('/api/search/username?q=player', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});

// 2. Send friend request
const sendRequest = await fetch('/api/friend-requests', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ toAccountId: 'TARGET_ACCOUNT_ID' })
});

// 3. Target user accepts request
const acceptRequest = await fetch('/api/friend-requests/REQUEST_ID/accept', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});

// 4. Get updated friend list
const friendList = await fetch('/api/friends/YOUR_ACCOUNT_ID', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
```

---

## Support

For issues or questions about the API, please contact the development team or refer to the main README.md file.

**Version**: 1.0.0  
**Last Updated**: October 28, 2025
