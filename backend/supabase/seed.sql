-- Seed Data for Lock-In Development
-- This script creates sample organizations, users, projects, and shifts for testing

-- Start fresh (optional - comment out if you want to preserve data)
-- DELETE FROM recognitions;
-- DELETE FROM blockers;
-- DELETE FROM goals;
-- DELETE FROM mood_entries;
-- DELETE FROM messages;
-- DELETE FROM chat_participants;
-- DELETE FROM chats;
-- DELETE FROM exceptions;
-- DELETE FROM clock_entries;
-- DELETE FROM shifts;
-- DELETE FROM project_assignments;
-- DELETE FROM phases;
-- DELETE FROM projects;
-- DELETE FROM users;
-- DELETE FROM organizations;

-- ============================================================================
-- CREATE ORGANIZATIONS
-- ============================================================================

INSERT INTO organizations (name, hierarchy_levels, settings)
VALUES (
  'Zion Mainframe',
  ARRAY['Architect', 'Commander', 'Operator', 'Crew'],
  '{
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
  }'
)
ON CONFLICT DO NOTHING;

-- Get the org ID (replace with actual ID after insert)
WITH org AS (
  SELECT id FROM organizations WHERE name = 'Zion Mainframe' LIMIT 1
)

-- ============================================================================
-- CREATE USERS
-- ============================================================================

INSERT INTO users (org_id, username, full_name, email, password_hash, role, hierarchy_level, color, hourly_rate, xp, skills, badges)
SELECT org.id, 'neo', 'Neo Anderson', 'neo@lockin.local', '$2b$10$placeholder', 'FOUNDER', 0, '#ccff00', 150, 5000, ARRAY['Leadership', 'System Architecture'], ARRAY['Founder'] FROM org
UNION ALL
SELECT org.id, 'trinity', 'Trinity Moss', 'trinity@lockin.local', '$2b$10$placeholder', 'MANAGER', 1, '#00f0ff', 95, 3200, ARRAY['Hacking', 'Operations'], ARRAY['Top Performer'] FROM org
UNION ALL
SELECT org.id, 'morpheus', 'Morpheus King', 'morpheus@lockin.local', '$2b$10$placeholder', 'LEAD', 2, '#ff00aa', 85, 2800, ARRAY['Strategy'], ARRAY['Mentor'] FROM org
UNION ALL
SELECT org.id, 'tank', 'Tank Operator', 'tank@lockin.local', '$2b$10$placeholder', 'MEMBER', 3, '#ffffff', 45, 1200, ARRAY['Communications'], ARRAY['Reliable'] FROM org
UNION ALL
SELECT org.id, 'dozer', 'Dozer Tank', 'dozer@lockin.local', '$2b$10$placeholder', 'MEMBER', 3, '#a0a0a0', 45, 1100, ARRAY['Support'], ARRAY[]::TEXT[] FROM org
ON CONFLICT (org_id, username) DO NOTHING;

-- ============================================================================
-- CREATE PROJECTS
-- ============================================================================

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Zion Mainframe' LIMIT 1
),
users_data AS (
  SELECT id, username FROM users WHERE org_id = (SELECT id FROM org)
)
INSERT INTO projects (org_id, name, description, status, lead_id, color)
SELECT 
  org.id,
  'Nebuchadnezzar Rebuild',
  'System overhaul for the main hovercraft. Critical priority.',
  'ACTIVE',
  (SELECT id FROM users_data WHERE username = 'morpheus'),
  '#00f0ff'
FROM org
UNION ALL
SELECT
  org.id,
  'Matrix Infiltration',
  'Covert ops to extract potential one.',
  'DRAFT',
  (SELECT id FROM users_data WHERE username = 'trinity'),
  '#ccff00'
FROM org
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE PHASES
-- ============================================================================

WITH projects_data AS (
  SELECT id, name FROM projects WHERE name IN ('Nebuchadnezzar Rebuild', 'Matrix Infiltration')
)
INSERT INTO phases (project_id, name, goals, order_index)
SELECT 
  (SELECT id FROM projects_data WHERE name = 'Nebuchadnezzar Rebuild'),
  'Diagnostics',
  ARRAY['Check EMP cores', 'Hull integrity scan'],
  0
UNION ALL
SELECT
  (SELECT id FROM projects_data WHERE name = 'Nebuchadnezzar Rebuild'),
  'Refit',
  ARRAY['Install V2 software', 'Replace coils'],
  1
UNION ALL
SELECT
  (SELECT id FROM projects_data WHERE name = 'Matrix Infiltration'),
  'Recon',
  ARRAY['Locate target'],
  0
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE PROJECT ASSIGNMENTS
-- ============================================================================

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Zion Mainframe' LIMIT 1
),
proj AS (
  SELECT id FROM projects WHERE name = 'Nebuchadnezzar Rebuild'
),
team AS (
  SELECT id FROM users WHERE org_id = (SELECT id FROM org) AND username IN ('tank', 'dozer')
)
INSERT INTO project_assignments (project_id, user_id)
SELECT proj.id, team.id FROM proj, team
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ============================================================================
-- CREATE SHIFTS
-- ============================================================================

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Zion Mainframe' LIMIT 1
),
proj AS (
  SELECT id FROM projects WHERE name = 'Nebuchadnezzar Rebuild' LIMIT 1
),
phase AS (
  SELECT id FROM phases WHERE name = 'Refit' LIMIT 1
),
assignee AS (
  SELECT id FROM users WHERE username = 'tank' LIMIT 1
)
INSERT INTO shifts (org_id, project_id, phase_id, assignee_id, start_at, end_at, allowed_early_minutes, personal_goals, bounty)
SELECT
  org.id,
  proj.id,
  phase.id,
  assignee.id,
  NOW()::date + '09:00'::time,
  NOW()::date + '17:00'::time,
  30,
  ARRAY['Calibrate engine 1', 'Sync nav computer'],
  '100% Efficiency Rating'
FROM org, proj, phase, assignee
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE MOOD ENTRIES (Sample Data)
-- ============================================================================

WITH tank_user AS (
  SELECT id FROM users WHERE username = 'tank' LIMIT 1
)
INSERT INTO mood_entries (employee_id, timestamp, type, mood_value, mood_emoji, comment, is_shared, is_urgent)
SELECT tank_user.id, NOW() - INTERVAL '5 days', 'PRE_SHIFT', 4, '😊', NULL, false, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '5 days' + INTERVAL '8 hours', 'POST_SHIFT', 3, '😐', 'Long day, tough bug.', true, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '4 days', 'PRE_SHIFT', 5, '😁', NULL, false, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '4 days' + INTERVAL '8 hours', 'POST_SHIFT', 4, '😊', 'Productive session.', false, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '3 days', 'PRE_SHIFT', 3, '😐', NULL, false, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '3 days' + INTERVAL '8 hours', 'POST_SHIFT', 2, '😟', 'Feeling blocked on the mainframe integration.', true, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '2 days', 'PRE_SHIFT', 2, '😟', 'Need to talk about the blocker.', false, true FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '2 days' + INTERVAL '8 hours', 'POST_SHIFT', 3, '😐', NULL, false, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '1 day', 'PRE_SHIFT', 4, '😊', NULL, false, false FROM tank_user
UNION ALL
SELECT tank_user.id, NOW() - INTERVAL '1 day' + INTERVAL '8 hours', 'POST_SHIFT', 5, '😁', 'Broke through the blocker! Big win!', true, false FROM tank_user
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE GOALS
-- ============================================================================

WITH tank_user AS (
  SELECT id FROM users WHERE username = 'tank' LIMIT 1
)
INSERT INTO goals (employee_id, title, description, target_date, progress, related_skills)
SELECT 
  tank_user.id,
  'Master V2 Nav-Comms',
  'Complete all training modules for the new navigation comms system.',
  NOW() + INTERVAL '30 days',
  65,
  ARRAY['Communications', 'V2 Systems']
FROM tank_user
UNION ALL
SELECT
  tank_user.id,
  'Achieve Level 4 Operator',
  'Gain enough XP and proficiency to be promoted.',
  NOW() + INTERVAL '90 days',
  20,
  ARRAY['Leadership']
FROM tank_user
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE BLOCKERS
-- ============================================================================

WITH tank_user AS (
  SELECT id FROM users WHERE username = 'tank' LIMIT 1
)
INSERT INTO blockers (employee_id, timestamp, severity, description, is_resolved)
SELECT 
  tank_user.id,
  NOW() - INTERVAL '3 days',
  'MAJOR',
  'Mainframe integration API is not responding as documented.',
  false
FROM tank_user
UNION ALL
SELECT
  tank_user.id,
  NOW() - INTERVAL '10 days',
  'MINOR',
  'Test environment credentials expired.',
  true
FROM tank_user
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE RECOGNITIONS
-- ============================================================================

WITH recipient AS (
  SELECT id FROM users WHERE username = 'tank' LIMIT 1
),
giver AS (
  SELECT id FROM users WHERE username = 'morpheus' LIMIT 1
)
INSERT INTO recognitions (recipient_id, giver_id, timestamp, message, type)
SELECT 
  recipient.id,
  giver.id,
  NOW() - INTERVAL '1 day',
  'Great job solving that tough mainframe bug!',
  'KUDOS'
FROM recipient, giver
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATE CHAT CHANNELS
-- ============================================================================

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Zion Mainframe' LIMIT 1
),
creator AS (
  SELECT id FROM users WHERE username = 'neo' LIMIT 1
)
INSERT INTO chats (org_id, name, is_group, created_by)
SELECT org.id, 'general', true, creator.id FROM org, creator
UNION ALL
SELECT org.id, 'engineering', true, creator.id FROM org, creator
UNION ALL
SELECT org.id, 'announcements', true, creator.id FROM org, creator
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ADD CHAT PARTICIPANTS
-- ============================================================================

WITH chats_data AS (
  SELECT id, name FROM chats WHERE name IN ('general', 'engineering', 'announcements')
),
users_data AS (
  SELECT id FROM users WHERE username IN ('neo', 'trinity', 'morpheus', 'tank', 'dozer')
)
INSERT INTO chat_participants (chat_id, user_id)
SELECT c.id, u.id
FROM chats_data c, users_data u
ON CONFLICT (chat_id, user_id) DO NOTHING;

-- ============================================================================
-- CREATE SAMPLE MESSAGES
-- ============================================================================

WITH general_chat AS (
  SELECT id FROM chats WHERE name = 'general' LIMIT 1
),
neo_user AS (
  SELECT id FROM users WHERE username = 'neo' LIMIT 1
)
INSERT INTO messages (chat_id, sender_id, content, type, timestamp)
SELECT 
  general_chat.id,
  neo_user.id,
  'Welcome to Lock-In! This is where we coordinate all team activities.',
  'TEXT',
  NOW() - INTERVAL '1 hour'
FROM general_chat, neo_user
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  (SELECT COUNT(*) FROM organizations) as organizations,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM phases) as phases,
  (SELECT COUNT(*) FROM shifts) as shifts,
  (SELECT COUNT(*) FROM mood_entries) as mood_entries,
  (SELECT COUNT(*) FROM goals) as goals,
  (SELECT COUNT(*) FROM blockers) as blockers,
  (SELECT COUNT(*) FROM recognitions) as recognitions,
  (SELECT COUNT(*) FROM chats) as chats,
  (SELECT COUNT(*) FROM messages) as messages;
