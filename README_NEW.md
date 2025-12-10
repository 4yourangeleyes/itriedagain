# Lock-In - Work Management & Time Tracking Platform

**Status:** Phase 1 & 2 Complete - Ready for Frontend Integration

## 🎯 Project Overview

Lock-In is a high-agency work management platform built with React + TypeScript + Tailwind CSS, powered by Supabase backend.

**Key Features:**
- Role-based team management with hierarchies
- Project and shift scheduling
- Real-time time tracking with clock in/out
- Team chat and messaging
- Employee wellness tracking (mood, goals, blockers)
- Manager insights and analytics
- Permission-based access control

## 📊 Current Status

### ✅ Completed

**Phase 1: Real Data Functions**
- Comprehensive API service layer (`services/api.ts`)
- 11 service modules with 50+ functions
- Input validation and error handling
- Permission checking utilities
- Real-time subscription setup

**Phase 2: Database Schema**
- Complete PostgreSQL schema (`backend/supabase/schema.sql`)
- 15+ interconnected tables
- Row-level security (RLS) policies
- Helper functions for analytics
- Seed data for development (`backend/supabase/seed.sql`)

**Documentation**
- `AUDIT_REPORT.md` - Comprehensive app audit
- `PHASE_1_2_COMPLETE.md` - Implementation details
- `INTEGRATION_GUIDE.md` - Frontend migration guide
- `backend/README.md` - Backend setup and usage

### 🚀 In Progress

**Next: Frontend Integration**
- Update all pages to use new API instead of mock DB
- Implement real authentication flow
- Enable real-time updates
- Test with live Supabase data

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     React Frontend (TypeScript)     │
│  Pages: Dashboard, Projects, etc.   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   API Service Layer (services/api.ts)
│  ├─ authService                     │
│  ├─ userService                     │
│  ├─ projectService                  │
│  ├─ shiftService                    │
│  ├─ clockService                    │
│  ├─ chatService                     │
│  ├─ wellnessService                 │
│  ├─ analyticsService                │
│  └─ Permission utilities            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ Database Layer (services/db.ts)     │
│  Supabase Client + Data Mappers     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Supabase Cloud                    │
│  ├─ PostgreSQL Database             │
│  ├─ Real-time Subscriptions         │
│  ├─ Auth (JWT + Sessions)           │
│  └─ Row-Level Security              │
└─────────────────────────────────────┘
```

## 🗂️ Project Structure

```
lock-in/
├── src/
│   ├── App.tsx                      # Main app + auth context
│   ├── types.ts                     # TypeScript interfaces
│   ├── components/
│   │   └── UI.tsx                   # Reusable components
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── Schedule.tsx
│   │   ├── TimeClock.tsx
│   │   ├── Chat.tsx
│   │   ├── People.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   └── services/
│       ├── api.ts                   # 🆕 HIGH-LEVEL API
│       ├── db.ts                    # 🆕 DATABASE LAYER
│       └── mockDb.ts                # (deprecated)
├── backend/
│   ├── supabase/
│   │   ├── schema.sql               # 🆕 DATABASE SCHEMA
│   │   └── seed.sql                 # 🆕 SEED DATA
│   ├── README.md                    # 🆕 BACKEND GUIDE
│   └── setup.sh                     # 🆕 SETUP SCRIPT
├── .env.example                     # 🆕 ENV TEMPLATE
├── .vscode/
│   └── mcp.json                     # 🆕 SUPABASE MCP CONFIG
├── AUDIT_REPORT.md                  # 🆕 DETAILED AUDIT
├── PHASE_1_2_COMPLETE.md            # 🆕 PHASE COMPLETION
├── INTEGRATION_GUIDE.md             # 🆕 MIGRATION GUIDE
└── package.json                     # (updated with Supabase)
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add your Supabase credentials
REACT_APP_SUPABASE_URL=https://hdhqvfcbmbrxwbbtuoev.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Setup

```bash
# Option A: Supabase Dashboard
# 1. Go to https://app.supabase.com
# 2. Select your project
# 3. SQL Editor → New Query
# 4. Copy backend/supabase/schema.sql
# 5. Run query

# Option B: Command line (if using Supabase CLI)
# supabase db push
```

### 3. Load Sample Data (Optional)

```bash
# In Supabase SQL Editor, run backend/supabase/seed.sql
```

### 4. Install & Run

```bash
npm install
npm run dev
```

## 📖 API Services Overview

### Authentication Service
```typescript
await authService.signup(email, password, fullName, username, orgId);
await authService.login(email, password);
await authService.logout();
await authService.getCurrentUser();
```

### User Service
```typescript
await userService.getUser(userId);
await userService.getUsers(orgId);
await userService.createUser({ username, fullName, ... });
await userService.updateUser(userId, updates);
```

### Project Service
```typescript
await projectService.getProjects(orgId);
await projectService.createProject(projectData);
await projectService.assignUsersToProject(projectId, userIds);
```

### Time Clock Service
```typescript
await clockService.clockIn(userId, shiftId);
await clockService.clockOut(entryId, summary, moraleScore, bountyClaimed);
await clockService.rateShift(entryId, rating, comment, approveBounty);
```

### Wellness Service
```typescript
await wellnessService.logMood(employeeId, type, moodValue, emoji);
await wellnessService.createGoal(employeeId, title, description, targetDate);
await wellnessService.reportBlocker(employeeId, severity, description);
```

### Analytics Service
```typescript
await analyticsService.getBurnRate(orgId);
await analyticsService.getActiveUsersCount(orgId);
await analyticsService.getTeamEfficiency(orgId);
await analyticsService.getMoodTrend(employeeId);
```

## 🔐 Security Features

✅ **Row-Level Security (RLS)**
- Organization data isolation
- User privacy controls
- Hierarchical permissions

✅ **Authentication**
- Supabase built-in auth
- Password hashing (bcrypt)
- Session management

✅ **Input Validation**
- Email format validation
- Username validation (3+ chars, alphanumeric)
- Password strength requirements
- Business logic validation

✅ **Permission Checking**
- Role-based access control (RBAC)
- Hierarchical permission enforcement
- Project-level access control

## 📊 Database Tables

### Core (7 tables)
- `organizations` - Multi-tenant support
- `users` - Team members with roles
- `projects` - Work projects
- `project_assignments` - Team assignments
- `phases` - Project phases
- `shifts` - Scheduled work
- `clock_entries` - Time tracking

### Workflows (6 tables)
- `exceptions` - Time corrections
- `chats` - Message channels
- `chat_participants` - Channel membership
- `messages` - Message history

### Wellness (4 tables)
- `mood_entries` - Daily mood tracking
- `goals` - Employee goals
- `blockers` - Work impediments
- `recognitions` - Employee recognition

### Analytics (1 table)
- `audit_log` - Compliance tracking

## 🔄 Data Flow Example

### Time Tracking Flow
```
User clicks "Clock In"
    ↓
clockService.canClockIn() validates time window
    ↓
clockService.clockIn() creates entry
    ↓
Subscribe to real-time updates
    ↓
Dashboard shows active user
    ↓
User clicks "Clock Out"
    ↓
clockService.clockOut() validates and completes entry
    ↓
wellnessService.logMood() records post-shift mood
    ↓
Manager can rateShift() with feedback
```

## 📝 Key Differences from Mock DB

| Feature | Mock DB | Real API |
|---------|---------|----------|
| Storage | Browser localStorage | Supabase PostgreSQL |
| Users | 1 browser session | Multi-user, multi-org |
| Validation | Minimal | Comprehensive |
| Real-time | BroadcastChannel | WebSocket subscriptions |
| Persistence | Temporary (cache) | Permanent (database) |
| Backups | None | Automatic |
| Scalability | Single user | Enterprise |

## 🧪 Testing Checklist

- [ ] Login flow with real credentials
- [ ] Create organization and add users
- [ ] Create projects with phases
- [ ] Schedule shifts for team
- [ ] Clock in/out with time validation
- [ ] Post-shift mood logging
- [ ] Chat messaging and real-time sync
- [ ] Goal and blocker creation
- [ ] Manager ratings and approvals
- [ ] Analytics calculations
- [ ] Permission enforcement

## 🎯 Next Steps (Phase 3+)

1. **Frontend Integration** (3-5 hours)
   - Update all pages to use new API
   - Implement real auth flow
   - Test with live data

2. **Authentication System** (2-3 days)
   - Supabase Auth setup
   - Password hashing and validation
   - Session management
   - JWT tokens

3. **REST API** (3-5 days) - *Optional (Supabase provides auto-generated API)*
   - Custom endpoints if needed
   - Additional business logic
   - Rate limiting and throttling

4. **Enhanced Features** (Ongoing)
   - Recurring shifts
   - Time-off management
   - Advanced reporting
   - Mobile app

## 📚 Documentation

- **`AUDIT_REPORT.md`** - Full app audit with findings and recommendations
- **`PHASE_1_2_COMPLETE.md`** - What was built in Phase 1 & 2
- **`INTEGRATION_GUIDE.md`** - How to update frontend pages
- **`backend/README.md`** - Backend setup and usage guide
- **`backend/supabase/schema.sql`** - Database schema
- **`backend/supabase/seed.sql`** - Development seed data

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## 🔧 Environment Variables

```
# Required
REACT_APP_SUPABASE_URL=https://hdhqvfcbmbrxwbbtuoev.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Optional
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3001
```

## 🚀 Deployment

### Frontend
- Deploy to Vercel, Netlify, or similar
- Ensure environment variables are set
- Point to production Supabase instance

### Database
- Supabase handles deployment
- Backups automatic
- Monitor performance in dashboard

## 📞 Support & Troubleshooting

### Common Issues

**"Invalid API key"**
- Verify REACT_APP_SUPABASE_ANON_KEY in .env
- Check key hasn't expired in Supabase dashboard

**"RLS violation"**
- Check user is authenticated
- Verify user belongs to organization
- Check RLS policies in Supabase

**"Table does not exist"**
- Run schema.sql in Supabase SQL editor
- Verify migrations completed
- Check database health

**"Real-time not working"**
- Enable Realtime in Supabase dashboard
- Check WebSocket connection in browser dev tools
- Verify channel name matches table name

## 📞 Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

Private project - not licensed for external use

---

**Last Updated:** December 8, 2025  
**Phase Status:** 1 & 2 Complete ✅  
**Next Phase:** Frontend Integration  
**Est. Time to Complete:** 2-3 weeks for full production readiness
