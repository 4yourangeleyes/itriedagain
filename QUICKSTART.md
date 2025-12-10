# Lock-In Quick Start Guide

## What is Lock-In?

Lock-In is a comprehensive team management and time-tracking system designed for high-agency organizations. It provides:
- 🏢 Organization creation and team management
- 👥 Role-based access control
- ⏱️ Precise time tracking with clock in/out
- 📊 Real-time analytics and dashboards
- 💬 Team messaging and communications
- 📈 Performance tracking and goal management
- 😊 Mood/wellness tracking for team health
- 🎯 Project and shift management

## Getting Started

### 1. Create Your Organization

**First time user?**
1. Go to the app and click "CREATE NEW ORGANIZATION"
2. Fill in:
   - Organization Name (e.g., "Acme Corp")
   - Your Full Name
   - Your Email Address
   - A Secure Password
3. Click "Create Organization"

You're now the **Founder** and can manage your team!

### 2. Add Team Members

**As a Founder:**
1. Click "Team Management" in the sidebar (under Settings)
2. Click "+ Add Team Member"
3. Enter:
   - Team member's email
   - Their full name
   - Their role (Member, Lead, or Manager)
4. A **secure password is auto-generated** automatically
5. Share the login credentials with the team member

**Team Members can then:**
1. Go to Sign In
2. Enter their email and the provided password
3. They can update their password on first login (optional)

### 3. Core Features

#### Dashboard
- Overview of active team members
- Recent activity feed
- Burn rate (real-time cost tracking)
- Quick stats

#### Projects
- Create and manage projects
- Assign team members
- Track phases and milestones
- Allocate resources with timeline view

#### Schedule
- View team shifts
- Create recurring shifts
- Plan resource allocation
- Prevent scheduling conflicts

#### Time Clock
- Clock in/out for shifts
- Track work time
- Submit summaries
- Add morale ratings
- Claim bounties if available

#### Team
- View all team members
- See individual performance
- Track mood and wellness
- Monitor goals and blockers
- Give recognition

#### Messages
- Direct messaging with team members
- Group chats
- Real-time notifications
- Share updates

#### Settings (Founders/Managers Only)
- Organization configuration
- Team Management
- Permission settings
- System preferences

## User Roles & Permissions

### FOUNDER (Hierarchy Level 0)
- ✅ Create organization
- ✅ Manage all team members (create/delete/edit)
- ✅ Manage all projects and shifts
- ✅ Configure organization settings
- ✅ View analytics and financials
- ✅ Approve time exceptions

### MANAGER (Hierarchy Level 1)
- ✅ Create projects and shifts
- ✅ Manage team members (limited)
- ✅ Approve exceptions
- ✅ View team analytics
- ✅ Rate team performance
- ❌ Cannot modify organization settings

### LEAD (Hierarchy Level 2)
- ✅ Create shifts for their projects
- ✅ View team dashboards
- ✅ Rate team members
- ✅ Submit clock entries
- ❌ Cannot create projects
- ❌ Cannot manage other users

### MEMBER (Hierarchy Level 3)
- ✅ Clock in/out
- ✅ View personal dashboard
- ✅ Track goals and mood
- ✅ Participate in messaging
- ✅ View team members
- ❌ Cannot create projects or shifts
- ❌ Cannot approve anything

## Common Tasks

### Add a New Team Member
1. Go to **Team Management**
2. Click **+ Add Team Member**
3. Enter email, name, and role
4. Share the auto-generated password with them
5. They can sign in immediately

### Create a Project
1. Go to **Projects**
2. Click **+ New Project**
3. Enter project details (name, description, lead)
4. Add team members to the project
5. Create phases within the project
6. Set status to ACTIVE when ready

### Schedule Shifts
1. Go to **Schedule**
2. Click **+ New Shift**
3. Select: Project, Phase, Team Member, Date/Time
4. Set allowed early clock-in time
5. Optionally add bounties or goals
6. Team member receives notification

### Clock In/Out
1. Go to **Time Clock**
2. See your current/upcoming shifts
3. Click **Clock In** when work starts
4. Clock automatically **checks if you're in the time window**
5. Click **Clock Out** when done
6. Add work summary and morale rating (1-5)
7. Optionally claim bounty if available

### Track Team Performance
1. Go to **Team**
2. Click on any team member
3. View their:
   - Latest mood indicator
   - Burnout risk level
   - Engagement percentage
   - Goal progress
   - Recent mood trends
   - Active goals
   - Outstanding blockers
   - Recognition history

## Best Practices

### For Founders
- ✅ Set up your team early
- ✅ Create clear project phases
- ✅ Regular one-on-ones with leads
- ✅ Monitor team mood trends
- ✅ Give recognition frequently
- ✅ Review analytics weekly

### For Managers
- ✅ Create realistic shift schedules
- ✅ Rate team performance fairly
- ✅ Respond to exceptions promptly
- ✅ Support team members with blockers
- ✅ Celebrate wins with recognition
- ✅ Check in on mood scores

### For Leads & Members
- ✅ Clock in on time
- ✅ Clock out promptly
- ✅ Update your goals weekly
- ✅ Share mood/wellness honestly
- ✅ Report blockers early
- ✅ Communicate in team chat

## Troubleshooting

### Can't Sign In?
- ✅ Double-check email spelling
- ✅ Verify password with admin
- ✅ Try password reset if available
- ✅ Contact your Founder

### Clock In Button Disabled?
- ✅ Check if shift hasn't started yet
- ✅ Verify you're assigned to a shift
- ✅ Check organization's strictMode setting
- ✅ Contact your manager

### Can't See Team Member?
- ✅ Verify they're in same organization
- ✅ Check their role permissions
- ✅ Verify they've accepted the invite

### Missing Data?
- ✅ Refresh the page (F5)
- ✅ Check your internet connection
- ✅ Clear browser cache
- ✅ Try a different browser

## Password Management

### First Login Password
- Provided by your Founder/Manager
- **Required**: Change on first use (recommended)

### Forgot Password?
- Contact your Founder or Manager
- They can reset via Team Management
- They'll provide a new auto-generated password

### Security Tips
- ✅ Never share your password
- ✅ Use unique passwords
- ✅ Change password every 90 days
- ✅ Log out on shared computers

## Data Privacy

Your data is:
- 🔒 Encrypted in transit (HTTPS)
- 🔒 Encrypted at rest (PostgreSQL)
- 🔒 Visible only to your organization
- 🔒 Never shared with third parties
- 🔒 Backed up daily

[See our Privacy Policy for details]

## Support

### In-App Help
- Click the **?** icon for feature tooltips
- Hover over items for descriptions

### Technical Support
- Email: support@lock-in.app
- Chat: Available in app (coming soon)
- Documentation: https://docs.lock-in.app

### Feature Requests
- Use the feedback form in settings
- Vote on proposed features
- Join our community forum

## System Requirements

- **Browser**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Internet**: Stable connection required
- **Device**: Desktop, tablet, or mobile
- **Accessibility**: WCAG 2.1 AA compliant

## Getting More Out of Lock-In

### Advanced Features
- **Custom Hierarchy Levels**: Configure your org structure
- **Project Templates**: Save and reuse project patterns
- **Recurring Shifts**: Set up automatic shift generation
- **Bounty Rewards**: Incentivize performance
- **Goal Tracking**: Align team efforts with objectives
- **Real-Time Notifications**: Get alerts instantly

### Integration Possibilities
- Slack integration (planned)
- Calendar sync (planned)
- Email notifications (in development)
- API for custom workflows (coming)

---

**Version**: 1.0.0
**Last Updated**: December 10, 2024
**Status**: ✅ Production Ready

Welcome to Lock-In! 🎯
