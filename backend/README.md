# Lock-In Backend Setup

This directory contains the database schema, seed data, and backend configuration for the Lock-In app.

## Overview

Lock-In uses **Supabase** as the backend, which provides:
- PostgreSQL database
- Real-time subscriptions
- Built-in authentication
- Row-level security
- Auto-generated APIs

## Quick Start

### 1. Set Environment Variables

Create a `.env` file in the project root:

```bash
REACT_APP_SUPABASE_URL=https://hdhqvfcbmbrxwbbtuoev.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Get your anon key from:
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API → Copy the `anon (public)` key

### 2. Create Database Schema

Option A - Using Supabase Dashboard:
1. Open SQL Editor in Supabase dashboard
2. Create new query
3. Copy contents of `backend/supabase/schema.sql`
4. Paste into editor and run

Option B - Using SQL files:
```bash
cd backend/supabase
# Copy schema.sql content to Supabase SQL Editor
# Then run seed.sql for sample data
```

### 3. Load Seed Data (Optional)

For development, load sample data:
1. In Supabase SQL Editor, open a new query
2. Copy contents of `backend/supabase/seed.sql`
3. Run to populate test data

Sample credentials after seed:
- Username: `neo` / Email: `neo@lockin.local` / Password: `password` (after setup)
- Username: `trinity` / Email: `trinity@lockin.local`
- Username: `tank` / Email: `tank@lockin.local`

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

## Database Schema

### Core Tables

**Organizations**
- Multi-tenant architecture
- Hierarchical role configuration
- Permission matrix settings

**Users**
- Role-based access control (FOUNDER, MANAGER, LEAD, MEMBER)
- Hierarchy levels for permission enforcement
- Skills and badges for team management

**Projects & Phases**
- Project management with status tracking
- Phase-based project breakdown
- Team assignment whitelist

**Shifts & Time Tracking**
- Flexible shift scheduling
- Clock entry with status tracking
- Support for recurring shifts (future)

**Wellness & Analytics**
- Mood tracking (pre/post-shift)
- Goal management with progress tracking
- Blocker identification and resolution
- Employee recognition system

### Relationships

```
Organization (1) ──→ (N) Users
           ├──→ (N) Projects
           ├──→ (N) Shifts
           ├──→ (N) Chats
           └──→ (N) ClockEntries

Project (1) ──→ (N) Phases
        ├──→ (N) Shifts
        └──→ (N) ProjectAssignments

User (1) ──→ (N) Shifts (as assignee)
     ├──→ (N) ClockEntries
     ├──→ (N) MoodEntries
     ├──→ (N) Goals
     ├──→ (N) Blockers
     └──→ (N) Recognitions
```

## API Layer

### Database Service (`services/db.ts`)

Low-level database operations:
- Direct Supabase client calls
- Raw data transformations
- Error handling

```typescript
import * as db from './services/db';

const users = await db.getUsers(orgId);
const user = await db.createUser(userData);
```

### API Service (`services/api.ts`)

High-level business logic:
- Validation
- Permission checking
- Error handling
- Analytics calculations

```typescript
import { userService, projectService } from './services/api';

const user = await userService.createUser(userData);
const project = await projectService.createProject(projectData);
```

## Service Organization

```
API Layer (services/api.ts)
├── authService
├── userService
├── orgService
├── projectService
├── phaseService
├── shiftService
├── clockService
├── exceptionService
├── chatService
├── wellnessService
├── analyticsService
└── subscriptions

↓ (wraps)

Database Layer (services/db.ts)
├── Authentication functions
├── User management
├── Organization operations
├── Project CRUD
├── Shift scheduling
├── Time tracking
├── Chat messaging
├── Wellness tracking
└── Real-time subscriptions

↓ (uses)

Supabase Client
├── PostgreSQL queries
├── Real-time subscriptions
├── Authentication
└── RLS policies
```

## Security Features

### Row-Level Security (RLS)

All tables have RLS enabled:
- Users can only see data from their organization
- Users can only access their own personal data
- Managers can access their team's data based on hierarchy

### Authentication

- Built-in Supabase Auth
- Password hashing (bcrypt)
- Session management
- Multi-factor authentication (optional)

### Data Validation

All inputs validated before database operations:
- Email format validation
- Username format (3+ chars, alphanumeric)
- Password strength (8+ chars, uppercase, numbers)
- Permission checks before sensitive operations

## Common Operations

### Create Organization

```typescript
const { org, user } = await orgService.createOrg(
  'Acme Corp',
  'John Doe',
  ['Executive', 'Manager', 'Engineer', 'Intern']
);
```

### Add User to Organization

```typescript
const user = await userService.createUser({
  orgId: 'org-123',
  username: 'alice',
  fullName: 'Alice Johnson',
  role: 'LEAD',
  hierarchyLevel: 2,
  hourlyRate: 75,
});
```

### Create Project with Phases

```typescript
const project = await projectService.createProject({
  orgId: 'org-123',
  name: 'Website Redesign',
  status: 'ACTIVE',
  color: '#3498db',
  leadId: 'user-123',
  assignedUserIds: ['user-456', 'user-789'],
  phases: [
    { name: 'Design', goals: ['Wireframes', 'Mockups'] },
    { name: 'Development', goals: ['Frontend', 'Backend'] },
    { name: 'Testing', goals: ['QA', 'Bug fixes'] },
  ],
});
```

### Schedule Shift

```typescript
const shift = await shiftService.createShift({
  orgId: 'org-123',
  projectId: 'proj-456',
  phaseId: 'phase-789',
  assigneeId: 'user-abc',
  startAt: Date.now(),
  endAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours later
  allowedEarlyMinutes: 15,
  personalGoals: ['Complete feature X', 'Code review'],
  bounty: '$50 bonus',
});
```

### Time Tracking Flow

```typescript
// Clock in
const entry = await clockService.clockIn(userId, shiftId);

// ... work ...

// Clock out with summary
const completed = await clockService.clockOut(
  entryId,
  'Completed feature X, helped with bug fix',
  4, // Morale score 1-10
  true // Claiming bounty
);

// Manager rates the shift
await clockService.rateShift(
  entryId,
  5, // Rating 1-5
  'Excellent work!',
  true // Approve bounty
);
```

### Real-time Updates

```typescript
// Subscribe to clock entry changes
const unsubscribe = subscriptions.onClockEntriesChange(
  orgId,
  () => {
    console.log('Clock entries updated');
    loadClockEntries();
  }
);

// Subscribe to messages
const unsubscribe2 = subscriptions.onMessageReceived(
  chatId,
  () => {
    console.log('New message received');
    loadMessages();
  }
);

// Cleanup
unsubscribe();
unsubscribe2();
```

## Error Handling

```typescript
import { DatabaseError } from './services/db';

try {
  const user = await userService.createUser({
    username: 'test',
    fullName: 'Test User',
    orgId: 'org-123',
  });
} catch (error) {
  if (error instanceof DatabaseError) {
    console.error(`DB Error [${error.code}]: ${error.message}`);
  } else {
    console.error('Validation Error:', error.message);
  }
}
```

## Performance Considerations

### Indexing

Key tables are indexed for fast queries:
- `users` (org_id, role)
- `projects` (org_id, status)
- `shifts` (org_id, start_at, assignee_id)
- `clock_entries` (shift_id, user_id, status)
- `mood_entries` (employee_id, timestamp)

### Query Optimization

For complex operations:
```typescript
// Get full project with details
const project = await projectService.getProjects(orgId, true);
// includeDetails = true: Fetches all phases and assignments
// includeDetails = false: Returns minimal data only
```

### Caching Strategy (Optional)

Can be implemented using React Query or SWR:
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: projects } = useQuery(
  ['projects', orgId],
  () => projectService.getProjects(orgId)
);
```

## Testing

### Manual Testing

1. Create test organization
2. Add test users with different roles
3. Create projects and shifts
4. Test clock in/out with various times
5. Verify permission enforcement
6. Check real-time updates across tabs

### Automated Testing (Future)

```typescript
describe('Project Service', () => {
  test('should create project', async () => {
    const project = await projectService.createProject({
      // ... test data
    });
    expect(project.id).toBeDefined();
  });

  test('should validate project name', async () => {
    expect(() => projectService.createProject({
      name: '', // Invalid
      // ...
    })).rejects.toThrow();
  });
});
```

## Monitoring & Logging

### Enable Logging

In development, all database errors are logged to console:
```typescript
// In services/db.ts
console.error('Database Error:', error);
```

### Production Logs

Supabase provides audit logs in the dashboard:
- All data changes are logged
- User activity can be tracked
- Performance metrics available

## Deployment

### Production Checklist

- [ ] Enable RLS policies
- [ ] Set up backups
- [ ] Configure resource limits
- [ ] Set up monitoring alerts
- [ ] Enable API logging
- [ ] Review security policies
- [ ] Test failover procedures
- [ ] Document runbooks

### Environment-Specific Configuration

Development:
```
REACT_APP_ENV=development
REACT_APP_SUPABASE_URL=https://dev.supabase.co
```

Production:
```
REACT_APP_ENV=production
REACT_APP_SUPABASE_URL=https://prod.supabase.co
```

## Documentation

- **Schema Diagram:** See `backend/supabase/schema.sql`
- **API Reference:** See `services/api.ts`
- **Integration Guide:** See `INTEGRATION_GUIDE.md`
- **Types:** See `types.ts`

## Troubleshooting

### "Invalid API key"
- Check REACT_APP_SUPABASE_ANON_KEY in .env
- Verify key is copied correctly from Supabase dashboard

### "RLS violation"
- Check row-level security policies are correct
- Verify user is authenticated
- Ensure user is in correct organization

### "Table does not exist"
- Run schema.sql in Supabase SQL editor
- Verify all tables were created
- Check database for errors

### "Subscription not working"
- Verify Supabase realtime is enabled
- Check browser console for WebSocket errors
- Ensure correct channel name is used

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review error messages and logs
3. Check database health in Supabase dashboard
4. Test with sample data using seed.sql

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time API](https://supabase.com/docs/guides/realtime/overview)
