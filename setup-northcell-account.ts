/**
 * Setup Script for Northcell Studios Account
 * This script creates the Northcell Studios account and loads all 39 template blocks
 */

import { createClient } from '@supabase/supabase-js';
import { NORTHCELL_STUDIOS_TEMPLATES } from './services/webDevelopmentData';
import { UserProfile } from './types';
import * as fs from 'fs';
import * as path from 'path';

// Read environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

envLines.forEach(line => {
  const match = line.match(/^VITE_SUPABASE_URL=(.+)$/);
  if (match) SUPABASE_URL = match[1].trim();
  
  const keyMatch = line.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/);
  if (keyMatch) SUPABASE_ANON_KEY = keyMatch[1].trim();
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client for Node.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const NORTHCELL_EMAIL = 'design@northcellstudios.com';
const NORTHCELL_PASSWORD = 'samurai01';

async function setupNorthcellAccount() {
  console.log('🚀 Setting up Northcell Studios account...');
  console.log('');
  console.log('⚠️  IMPORTANT: Make sure you have run these migrations first:');
  console.log('   1. supabase/migrations/add_missing_profile_columns.sql');
  console.log('   2. supabase/migrations/003_contract_support.sql');
  console.log('');
  console.log('   Run them in Supabase Dashboard → SQL Editor');
  console.log('');
  
  try {
    // Step 1: Sign up the user
    console.log('📝 Creating account for:', NORTHCELL_EMAIL);
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: NORTHCELL_EMAIL,
      password: NORTHCELL_PASSWORD
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️  Account already exists, attempting to sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: NORTHCELL_EMAIL,
          password: NORTHCELL_PASSWORD
        });
        
        if (signInError) {
          throw new Error(`Sign in failed: ${signInError.message}`);
        }
        
        console.log('✅ Signed in to existing account');
      } else {
        throw signUpError;
      }
    } else {
      console.log('✅ Account created successfully');
    }
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Failed to get authenticated user');
    }
    
    console.log('👤 User ID:', user.id);
    
    // Step 2: Create/Update profile
    console.log('📋 Setting up user profile...');
    
    // Use basic profile fields that should exist
    const profileData: any = {
      id: user.id,
      full_name: 'Northcell Studios',
      email: NORTHCELL_EMAIL,
      company_name: 'Northcell Studios',
      industry: 'Web Development',
      currency: 'R',
      tax_enabled: true,
      tax_name: 'VAT',
      tax_rate: 15,
      updated_at: new Date().toISOString()
    };
    
    // Try to add optional fields (they may not exist if migrations haven't run)
    const optionalFields = {
      registration_number: '2024/123456/07',
      vat_registration_number: 'VAT12345',
      business_type: 1,
      jurisdiction: 'Republic of South Africa',
      phone: '+27 11 123 4567',
      address: '123 Digital Drive, Sandton, Johannesburg, 2196',
      website: 'https://northcellstudios.com'
    };
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({ ...profileData, ...optionalFields });
    
    if (profileError) {
      // Try with basic fields only if optional fields cause issues
      console.warn('⚠️  Some profile fields not available, using basic setup...');
      const { error: basicError } = await supabase
        .from('user_profiles')
        .upsert(profileData);
      
      if (basicError) {
        console.error('❌ Profile creation failed:', basicError);
        console.log('⚠️  Continuing with template loading anyway...');
      } else {
        console.log('✅ Basic profile created (run migrations for full profile)');
      }
    } else {
      console.log('✅ Profile created/updated');
    }
    
    // Step 3: Load template blocks
    console.log(`📦 Loading ${NORTHCELL_STUDIOS_TEMPLATES.length} template blocks...`);
    
    // First, delete any existing templates for this user to avoid duplicates
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete existing templates:', deleteError.message);
    }
    
    // Prepare templates for insertion (note: database will auto-generate UUID for id)
    const templatesForDb = NORTHCELL_STUDIOS_TEMPLATES.map((template) => {
      const dbTemplate: any = {
        // Don't set id, let database generate UUID
        user_id: user.id,
        name: template.name,
        category: template.category,
        doc_type: template.type,  // Schema uses 'doc_type'
        contract_type: template.contractType || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Handle invoice items
      if (template.items && template.items.length > 0) {
        dbTemplate.items = JSON.stringify(template.items);
      }
      
      // Handle contract clauses (both single clause and multiple clauses)
      if (template.clauses && template.clauses.length > 0) {
        dbTemplate.clauses = JSON.stringify(template.clauses);
      } else if (template.clause) {
        dbTemplate.clauses = JSON.stringify([template.clause]);
      }
      
      return dbTemplate;
    });
    
    // Insert templates in batches (Supabase has limits)
    const BATCH_SIZE = 10;
    let successCount = 0;
    
    for (let i = 0; i < templatesForDb.length; i += BATCH_SIZE) {
      const batch = templatesForDb.slice(i, i + BATCH_SIZE);
      
      const { error: insertError } = await supabase
        .from('templates')
        .insert(batch);
      
      if (insertError) {
        console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, insertError);
      } else {
        successCount += batch.length;
        console.log(`✅ Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} templates)`);
      }
    }
    
    console.log(`\n🎉 Setup complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Account: ${NORTHCELL_EMAIL}`);
    console.log(`   - Company: Northcell Studios`);
    console.log(`   - Industry: Web Development`);
    console.log(`   - Templates loaded: ${successCount} / ${NORTHCELL_STUDIOS_TEMPLATES.length}`);
    console.log(`   - Invoice templates: ${NORTHCELL_STUDIOS_TEMPLATES.filter(t => t.type === 'Invoice').length}`);
    console.log(`   - Contract templates: ${NORTHCELL_STUDIOS_TEMPLATES.filter(t => t.type === 'Contract').length}`);
    
    console.log(`\n🔐 Login credentials:`);
    console.log(`   Email: ${NORTHCELL_EMAIL}`);
    console.log(`   Password: ${NORTHCELL_PASSWORD}`);
    
    return {
      success: true,
      userId: user.id,
      templatesLoaded: successCount
    };
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    throw error;
  }
}

// Run the setup
setupNorthcellAccount()
  .then((result) => {
    console.log('\n✨ All done! You can now log in with the Northcell Studios account.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
