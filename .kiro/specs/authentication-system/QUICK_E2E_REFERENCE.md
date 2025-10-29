# Quick E2E Testing Reference

## 🚀 Quick Start

### Run Automated Tests
```bash
cd Server
npm test -- --testPathPattern=e2e.test.ts
```

### Start Server for Unity Testing
```bash
cd Server
npm run dev
```

### Verify Server is Running
Open browser: http://localhost:3000/health

## 📊 Test Status

| Component | Status | Tests | Result |
|-----------|--------|-------|--------|
| Server E2E Tests | ✅ Complete | 51/51 | PASSED |
| Unity Manual Tests | ⏳ Pending | - | - |

## 📁 Key Files

### Test Files
- `Server/src/__tests__/e2e.test.ts` - Automated test suite
- `Server/run-e2e-tests.bat` - Quick test runner

### Documentation
- `E2E_TEST_GUIDE.md` - Manual testing guide (Unity)
- `E2E_TEST_RESULTS.md` - Automated test results
- `E2E_TESTING_CHECKLIST.md` - Complete testing checklist
- `E2E_IMPLEMENTATION_SUMMARY.md` - Full implementation details

### Helper Scripts
- `Server/start-for-unity-testing.bat` - Start server for Unity
- `Server/run-e2e-tests.bat` - Run automated tests

## ✅ What's Tested

### Automated (Server-Side)
- ✓ Health check endpoint
- ✓ Registration flow (with validation)
- ✓ Login flow (with authentication)
- ✓ Token validation
- ✓ Session persistence
- ✓ Error scenarios (all types)
- ✓ Error messages
- ✓ Complete user journey

### Manual (Unity Client) - Pending
- ⏳ UI functionality
- ⏳ Unity-to-server integration
- ⏳ Error message display
- ⏳ Session persistence in Unity
- ⏳ Cross-platform testing

## 🎯 Test Coverage

### Requirements: 100%
- ✓ User Registration (Req 1)
- ✓ User Login (Req 2)
- ✓ Session Management (Req 3)
- ✓ Token Validation (Req 4)
- ⏳ Unity Client UI (Req 5) - Manual testing
- ✓ Password Security (Req 6)
- ✓ Error Handling (Req 7)

## 🔧 Common Commands

### Server
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run E2E tests only
npm test -- --testPathPattern=e2e.test.ts

# Start development server
npm run dev

# Build for production
npm run build
```

### Database
```bash
# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Show migrations
npm run migration:show
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | Check PostgreSQL is running on port 5126 |
| Tests fail | Verify database connection in .env |
| Unity can't connect | Check server URL in AuthConfig.asset |
| Token validation fails | Verify JWT_SECRET matches in .env |

## 📝 Next Steps

1. ✅ Server-side E2E tests - COMPLETE
2. ⏳ Run manual Unity client tests
3. ⏳ Complete testing checklist
4. ⏳ Document any issues found
5. ⏳ Fix critical bugs
6. ⏳ Prepare for production

## 📞 Need Help?

- **Detailed Testing**: See `E2E_TEST_GUIDE.md`
- **Test Results**: See `E2E_TEST_RESULTS.md`
- **Checklist**: See `E2E_TESTING_CHECKLIST.md`
- **Full Details**: See `E2E_IMPLEMENTATION_SUMMARY.md`

---

**Last Updated**: October 29, 2025  
**Status**: Server E2E Testing Complete ✅
