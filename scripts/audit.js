#!/usr/bin/env node

/**
 * Comprehensive Supabase Audit Script
 * Checks everything in your GritDocs project
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log('bold', title);
  console.log('='.repeat(60));
}

function subsection(title) {
  console.log('\n' + '-'.repeat(60));
  log('cyan', title);
  console.log('-'.repeat(60));
}

function checkmark(text, success = true) {
  log(success ? 'green' : 'red', `${success ? '✓' : '✗'} ${text}`);
}

function warning(text) {
  log('yellow', `⚠️  ${text}`);
}

function info(text) {
  log('blue', `ℹ️  ${text}`);
}

function main() {
  console.clear();
  log('bold', '🔍 SUPABASE PROJECT AUDIT - GritDocs');
  info('Project Ref: fopyamyrykwtlwgefxuq');
  info('URL: https://fopyamyrykwtlwgefxuq.supabase.co');

  // 1. Check .env.local
  section('1️⃣  ENVIRONMENT SETUP');
  checkEnvLocal();

  // 2. Check Supabase CLI
  section('2️⃣  SUPABASE CLI');
  checkSupabaseCLI();

  // 3. Check Link Status
  section('3️⃣  PROJECT LINK STATUS');
  checkProjectLink();

  // 4. Summary and Next Steps
  section('📋 AUDIT SUMMARY & NEXT STEPS');
  showNextSteps();
}

function checkEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    checkmark('.env.local file exists', false);
    warning('Create .env.local with Supabase credentials');
    return false;
  }

  checkmark('.env.local file exists');

  const content = fs.readFileSync(envPath, 'utf-8');
  const hasUrl = !content.includes('your-project.supabase.co');
  const hasKey = !content.includes('your_anon_key_here');

  if (hasUrl && hasKey) {
    checkmark('VITE_SUPABASE_URL is configured', true);
    checkmark('VITE_SUPABASE_ANON_KEY is configured', true);
    return true;
  } else {
    checkmark('VITE_SUPABASE_URL is configured', hasUrl);
    checkmark('VITE_SUPABASE_ANON_KEY is configured', hasKey);
    warning('Please add real credentials from https://app.supabase.com/projects');
    return false;
  }
}

function checkSupabaseCLI() {
  try {
    const version = execSync('supabase --version', { encoding: 'utf-8' });
    checkmark(`Supabase CLI installed: ${version.trim()}`, true);
    return true;
  } catch (e) {
    checkmark('Supabase CLI installed', false);
    warning('Install with: npm install -g supabase');
    return false;
  }
}

function checkProjectLink() {
  try {
    const projects = execSync('supabase projects list', { encoding: 'utf-8' });
    if (projects.includes('fopyamyrykwtlwgefxuq') && projects.includes('GritDocs')) {
      const isLinked = projects.includes('●');
      checkmark('GritDocs project found', true);
      checkmark('Project is linked locally', isLinked);
      return isLinked;
    } else {
      checkmark('GritDocs project found', false);
      return false;
    }
  } catch (e) {
    checkmark('Could not check project link', false);
    return false;
  }
}

function showNextSteps() {
  console.log('\n📝 QUICK START CHECKLIST:\n');
  
  const tasks = [
    ['Get credentials', 'https://app.supabase.com/projects → GritDocs → Settings → API'],
    ['Update .env.local', 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'],
    ['Run dev server', 'npm install && npm run dev'],
    ['Test connection', 'Check browser console for errors'],
    ['Run full audit', 'npm run audit:full (coming next)'],
  ];

  tasks.forEach(([step, instruction], i) => {
    console.log(`  ${i + 1}. ${step}`);
    log('yellow', `     → ${instruction}`);
  });

  console.log('\n' + '='.repeat(60));
  log('green', '\n🚀 Ready to audit once credentials are added!\n');
}

main();
