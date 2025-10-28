# API Controllers

This directory contains the API controllers for the Friend System.

## Controllers

### AccountController
Handles account-related operations:
- `POST /api/accounts` - Create a new account
- `GET /api/accounts/:accountId` - Get account by ID
- `PUT /api/accounts/:accountId` - Update account information

### FriendController
Handles friend-related operations:
- `GET /api/friends/:accountId` - Get friend list
- `POST /api/friend-requests` - Send friend request
- `POST /api/friend-requests/:requestId/accept` - Accept friend request
- `DELETE /api/friends/:friendAccountId` - Remove friend
- `GET /api/friend-requests/:accountId/pending` - Get pending requests
- `POST /api/friends/status` - Update online status
- `POST /api/friends/status/batch` - Get friends online status

### SearchController
Handles search operations:
- `GET /api/search/username?q=:query` - Search by username
- `GET /api/search/id/:accountId` - Search by ID

## Usage

All controllers are exported from `index.ts` and can be imported as:

```typescript
import { AccountController, FriendController, SearchController } from './controllers';
```

## Error Handling

All controllers implement comprehensive error handling:
- 400 Bad Request - Invalid input or validation errors
- 404 Not Found - Resource not found
- 409 Conflict - Duplicate resources (e.g., username already exists)
- 500 Internal Server Error - Unexpected errors

## Next Steps

To use these controllers, you need to:
1. Create Express routes in `Server/src/routes/`
2. Wire up the routes in `Server/src/index.ts`
3. Apply authentication middleware where needed
