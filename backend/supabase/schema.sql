-- Lock-In App - Supabase Database Schema
-- This file contains all tables, relationships, and initial functions

-- ============================================================================
-- 1. ORGANIZATIONS
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hierarchy_levels TEXT[] NOT NULL DEFAULT ARRAY['Manager', 'Lead', 'Member'],
  settings JSONB NOT NULL DEFAULT '{
    "permissions": {
      "create_project": 1,
      "manage_team": 1,
      "create_shift": 2,
      "approve_exceptions": 2,
      "view_analytics": 0,
      "view_financials": 0,
      "edit_timecards": 1
    },
    "requireHandover": true,
    "allowedEarlyClockIn": 15,
    "currency": "USD",
    "strictMode": false
  }',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS (with auth integration)
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('FOUNDER', 'MANAGER', 'LEAD', 'MEMBER')),
  hierarchy_level INTEGER NOT NULL DEFAULT 3,
  color TEXT DEFAULT '#ffffff',
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  xp INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, username)
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 3. PROJECTS
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DRAFT')),
  lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#38BDF8',
  budget DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_lead_id ON projects(lead_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================================================
-- 4. PROJECT ASSIGNMENTS (whitelist of who can work on a project)
-- ============================================================================
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_user_id ON project_assignments(user_id);

-- ============================================================================
-- 5. PHASES
-- ============================================================================
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_phases_project_id ON phases(project_id);

-- ============================================================================
-- 6. SHIFTS
-- ============================================================================
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  allowed_early_minutes INTEGER DEFAULT 0,
  handover_note TEXT,
  tagged_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bounty TEXT,
  personal_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shifts_org_id ON shifts(org_id);
CREATE INDEX idx_shifts_project_id ON shifts(project_id);
CREATE INDEX idx_shifts_assignee_id ON shifts(assignee_id);
CREATE INDEX idx_shifts_start_at ON shifts(start_at);

-- ============================================================================
-- 7. CLOCK ENTRIES (time tracking)
-- ============================================================================
CREATE TABLE clock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clock_in_at TIMESTAMP NOT NULL,
  clock_out_at TIMESTAMP,
  summary TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  manager_comment TEXT,
  morale_score INTEGER CHECK (morale_score >= 1 AND morale_score <= 10),
  bounty_claimed BOOLEAN DEFAULT false,
  bounty_awarded BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'LATE', 'EXCEPTION')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clock_entries_shift_id ON clock_entries(shift_id);
CREATE INDEX idx_clock_entries_user_id ON clock_entries(user_id);
CREATE INDEX idx_clock_entries_status ON clock_entries(status);
CREATE INDEX idx_clock_entries_clock_in_at ON clock_entries(clock_in_at);

-- ============================================================================
-- 8. EXCEPTIONS (time corrections, missed clock-outs)
-- ============================================================================
CREATE TABLE exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('MISSED_CLOCK_OUT', 'TIME_CORRECTION', 'EARLY_LEAVE', 'LATE_START')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
  requested_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  review_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exceptions_user_id ON exceptions(user_id);
CREATE INDEX idx_exceptions_status ON exceptions(status);
CREATE INDEX idx_exceptions_shift_id ON exceptions(shift_id);

-- ============================================================================
-- 9. CHATS (team messaging channels)
-- ============================================================================
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

CREATE INDEX idx_chats_org_id ON chats(org_id);
CREATE INDEX idx_chats_created_by ON chats(created_by);

-- ============================================================================
-- 10. CHAT PARTICIPANTS
-- ============================================================================
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);

-- ============================================================================
-- 11. MESSAGES
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'IMAGE')),
  image_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- ============================================================================
-- 12. MOOD ENTRIES (employee wellness)
-- ============================================================================
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('PRE_SHIFT', 'POST_SHIFT')),
  mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  mood_emoji TEXT,
  comment TEXT,
  is_shared BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mood_entries_employee_id ON mood_entries(employee_id);
CREATE INDEX idx_mood_entries_timestamp ON mood_entries(timestamp);
CREATE INDEX idx_mood_entries_type ON mood_entries(type);

-- ============================================================================
-- 13. GOALS (employee goals)
-- ============================================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  related_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_employee_id ON goals(employee_id);
CREATE INDEX idx_goals_target_date ON goals(target_date);

-- ============================================================================
-- 14. BLOCKERS (work blockers/impediments)
-- ============================================================================
CREATE TABLE blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('MINOR', 'MAJOR')),
  description TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blockers_employee_id ON blockers(employee_id);
CREATE INDEX idx_blockers_severity ON blockers(severity);
CREATE INDEX idx_blockers_is_resolved ON blockers(is_resolved);

-- ============================================================================
-- 15. RECOGNITIONS (kudos, wins, praise)
-- ============================================================================
CREATE TABLE recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'KUDOS' CHECK (type IN ('KUDOS', 'WIN')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recognitions_recipient_id ON recognitions(recipient_id);
CREATE INDEX idx_recognitions_giver_id ON recognitions(giver_id);
CREATE INDEX idx_recognitions_timestamp ON recognitions(timestamp);

-- ============================================================================
-- 16. AUDIT LOG (track all changes for compliance)
-- ============================================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active clock entries with user and project info
CREATE VIEW active_clock_entries AS
SELECT 
  ce.id,
  ce.shift_id,
  ce.user_id,
  ce.clock_in_at,
  u.full_name,
  u.hourly_rate,
  p.name as project_name,
  (NOW() - ce.clock_in_at) as elapsed_time
FROM clock_entries ce
JOIN shifts s ON ce.shift_id = s.id
JOIN users u ON ce.user_id = u.id
JOIN projects p ON s.project_id = p.id
WHERE ce.status = 'ACTIVE';

-- Team burnout risk
CREATE VIEW team_burnout_risk AS
SELECT 
  me.employee_id,
  u.full_name,
  AVG(me.mood_value) as avg_mood,
  COUNT(me.id) as mood_entries_count,
  MAX(me.timestamp) as last_mood_entry,
  CASE 
    WHEN AVG(me.mood_value) < 2.5 THEN 'HIGH'
    WHEN AVG(me.mood_value) < 3.0 THEN 'MEDIUM'
    ELSE 'LOW'
  END as burnout_risk_level
FROM mood_entries me
JOIN users u ON me.employee_id = u.id
WHERE me.timestamp > NOW() - INTERVAL '7 days'
GROUP BY me.employee_id, u.full_name;

-- Project resource utilization
CREATE VIEW project_utilization AS
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT pa.user_id) as assigned_users,
  COUNT(DISTINCT s.id) as total_shifts,
  SUM(EXTRACT(EPOCH FROM (s.end_at - s.start_at)) / 3600) as total_hours
FROM projects p
LEFT JOIN project_assignments pa ON p.id = pa.project_id
LEFT JOIN shifts s ON p.id = s.project_id
GROUP BY p.id, p.name;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see data from their organization
CREATE POLICY org_isolation ON users
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY org_isolation ON projects
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY org_isolation ON shifts
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY org_isolation ON clock_entries
  USING (user_id = auth.uid() OR shift_id IN (
    SELECT id FROM shifts WHERE org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  ));

-- Allow users to see their own mood entries
CREATE POLICY mood_visibility ON mood_entries
  USING (employee_id = auth.uid() OR is_shared = true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate burn rate for organization
CREATE OR REPLACE FUNCTION calculate_burn_rate(org_uuid UUID)
RETURNS DECIMAL AS $$
SELECT COALESCE(SUM(u.hourly_rate), 0)
FROM clock_entries ce
JOIN shifts s ON ce.shift_id = s.id
JOIN users u ON ce.user_id = u.id
WHERE s.org_id = org_uuid AND ce.status = 'ACTIVE'
$$ LANGUAGE SQL;

-- Get active users count
CREATE OR REPLACE FUNCTION get_active_users_count(org_uuid UUID)
RETURNS INTEGER AS $$
SELECT COUNT(DISTINCT user_id)
FROM clock_entries
WHERE org_id = org_uuid AND status = 'ACTIVE'
$$ LANGUAGE SQL;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clock_entries_updated_at BEFORE UPDATE ON clock_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exceptions_updated_at BEFORE UPDATE ON exceptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
Create TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blockers_updated_at BEFORE UPDATE ON blockers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
