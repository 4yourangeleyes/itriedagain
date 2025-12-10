# Phase 1 & 2 Implementation - Migration Guide

## Completed Tasks

### ✅ Phase 1: Real Data Functions

Created `/services/api.ts` - A comprehensive service layer that provides:

1. **Auth Service** (`authService`)
   - `signup()` - Create user with validation
   - `login()` - Authenticate user
   - `logout()` - Sign out
   - `getCurrentUser()` - Get logged in user
   - `setOnlineStatus()` - Update online status

2. **User Service** (`userService`)
   - `getUser()`, `getUsers()` - Fetch users
   - `createUser()` - Create new user with validation
   - `updateUser()` - Update user profile
   - `updateUserXP()` - Award XP points

3. **Organization Service** (`orgService`)
   - `getOrg()` - Get organization
   - `createOrg()` - Create organization with hierarchy levels
   - `updateOrg()` - Update org settings
   - `updatePermissions()` - Manage permission matrix

4. **Project Service** (`projectService`)
   - `getProjects()` - List projects
   - `createProject()` - Create project
   - `updateProject()`, `deleteProject()` - Manage projects
   - `assignUsersToProject()` - Add team members
   - `removeUserFromProject()` - Remove team members

5. **Shift Service** (`shiftService`)
   - `getShifts()` - Get organization shifts
   - `getShiftsByUser()` - Get user's shifts
   - `createShift()` - Schedule shift with validation
   - `getShiftsForWeek()` - Weekly view helper

6. **Time Clock Service** (`clockService`)
   - `canClockIn()` - Validate clock-in eligibility
   - `clockIn()` - Start work session
   - `clockOut()` - End session with validation
   - `rateShift()` - Manager rating with comments
   - `getTodayClockEntries()` - Today's entries

7. **Exception Service** (`exceptionService`)
   - `createException()` - Report exceptions (missed clock-out, time corrections)
   - `approveException()`, `denyException()` - Manager review
   - `getPendingExceptions()` - Workflow queue

8. **Chat Service** (`chatService`)
   - `getChats()` - User's conversations
   - `createChat()` - Start new channel
   - `getMessages()` - Chat history
   - `sendMessage()` - Send message

9. **Wellness Service** (`wellnessService`)
   - `logMood()` - Pre/post-shift mood tracking
   - `getGoals()`, `createGoal()` - Goal management
   - `updateGoalProgress()` - Track progress
   - `reportBlocker()`, `resolveBlocker()` - Impediment tracking
   - `giveRecognition()` - Employee recognition

10. **Analytics Service** (`analyticsService`)
    - `getBurnRate()` - Team cost calculation
    - `getActiveUsersCount()` - Live headcount
    - `getTeamBurnoutRisk()` - Wellness metric
    - `getTeamEfficiency()` - Performance metric
    - `getMoodTrend()` - Wellness trend analysis

11. **Permission Checking**
    - `checkPermission()` - Role-based access
    - `canManageUser()` - Hierarchy validation
    - `canEditProject()` - Project access control
    - `canApproveException()` - Exception workflow
    - `canCreateShift()` - Scheduling permissions

### ✅ Phase 2: Database Schema

Created `/backend/supabase/schema.sql` - Complete PostgreSQL schema with:

1. **Core Tables**
   - `organizations` - Company hierarchy and settings
   - `users` - Team members with roles and permissions
   - `projects` - Work projects with phases
   - `project_assignments` - User-project whitelist
   - `phases` - Project phases with goals
   - `shifts` - Scheduled work shifts
   - `clock_entries` - Time tracking records

2. **Workflow Tables**
   - `exceptions` - Time corrections and missed clock-outs
   - `chats` - Team messaging channels
   - `chat_participants` - Channel membership
   - `messages` - Message history

3. **Wellness Tables**
   - `mood_entries` - Pre/post-shift mood tracking
   - `goals` - Employee goals
   - `blockers` - Work impediments
   - `recognitions` - Kudos and wins

4. **Audit & Analytics**
   - `audit_log` - Compliance tracking
   - Views: `active_clock_entries`, `team_burnout_risk`, `project_utilization`

5. **Security Features**
   - Row Level Security (RLS) enabled
   - Organization data isolation policies
   - User privacy controls

6. **Database Functions**
   - `calculate_burn_rate()` - Team cost calculation
   - `get_active_users_count()` - Live headcount
   - `update_updated_at_column()` - Auto-timestamps
   - Auto-update triggers on all mutable tables

## What's Different from Mock DB

| Feature | Mock DB | Real API |
|---------|---------|----------|
| Data Storage | localStorage | Supabase PostgreSQL |
| Persistence | Browser cache | Cloud database |
| Validation | Minimal | Comprehensive |
| Transactions | None | Database level |
| Concurrency | Single browser | Multi-user safe |
| Real-time | BroadcastChannel | WebSocket subscriptions |
| Backups | None | Automatic |
| Scalability | Single user | Enterprise |

## Environment Setup Required

1. **Add Supabase Keys to `.env`:**
   ```
   REACT_APP_SUPABASE_URL=https://hdhqvfcbmbrxwbbtuoev.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create Database Schema:**
   - Copy contents of `backend/supabase/schema.sql`
   - Paste into Supabase SQL editor
   - Run to create all tables and functions

## Next Steps

### Before Using New API

1. **Update `App.tsx`** - Replace `db` import with new API
2. **Update all pages** - Replace mock DB calls with service calls
3. **Remove mockDb.ts** - No longer needed
4. **Test authentication** - Set up auth flow
5. **Enable RLS policies** - Secure data access

### Example: Updating a Page

**Before (Mock DB):**
```tsx
import { db } from '../services/mockDb';

const projects = await db.getProjects(user.orgId);
```

**After (Real API):**
```tsx
import { projectService } from '../services/api';

const projects = await projectService.getProjects(user.orgId);
```

### Example: Error Handling

The new API includes comprehensive error handling:

```tsx
try {
  const user = await userService.createUser({
    username: 'neo',
    fullName: 'Neo Anderson',
    orgId: 'org-123',
    role: 'MEMBER'
  });
} catch (error) {
  if (error instanceof db.DatabaseError) {
    console.error(`Database Error [${error.code}]: ${error.message}`);
  } else {
    console.error('Validation Error:', error.message);
  }
}
```

## Architecture

```
Frontend Pages
    ↓
API Service Layer (api.ts) - Business logic & validation
    ↓
Database Layer (db.ts) - Supabase calls
    ↓
Supabase Cloud
    ↓
PostgreSQL Database
```

## Key Improvements

✅ **Validation** - All inputs validated before database operations
✅ **Error Handling** - Meaningful error messages
✅ **Permissions** - Role-based access control functions
✅ **Real-time** - Subscription helpers for live updates
✅ **Analytics** - Built-in performance calculations
✅ **Security** - RLS policies, data isolation
✅ **Scalability** - Multi-user, multi-org support
✅ **Audit Trail** - All changes logged

## Testing the Migration

1. Create test organization
2. Add test users
3. Create test projects and shifts
4. Test clock in/out flow
5. Verify real-time updates
6. Check analytics calculations
7. Test permission enforcement

## Rollback Plan

If issues occur, the old mock database can still be used temporarily:
- Import from `services/mockDb.ts` instead of `api.ts`
- Pages will continue working with cached data
- Use this as a bridge while updating frontend code

---

**Status:** Ready for frontend integration
**Timeline:** 3-5 hours to update all pages
**Risk Level:** Low (API maintains same interface as mock DB)
