/**
 * Diagnostic: Show template categories in Canvas
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read environment variables
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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnostic() {
  try {
    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'design@northcellstudios.com',
      password: 'samurai01'
    });
    
    if (signInError) throw signInError;
    
    console.log('📊 DIAGNOSTIC: Template Categories for Contract Documents');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Get all CONTRACT templates
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', signInData.user.id)
      .eq('doc_type', 'Contract')
      .order('category', { ascending: true });
    
    if (error) throw error;
    
    console.log(`Total Contract Templates: ${templates.length}`);
    console.log('');
    
    // Group by category
    const byCategory: Record<string, any[]> = {};
    templates.forEach(t => {
      const cat = t.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(t);
    });
    
    console.log('Categories that SHOULD appear in Canvas dropdown:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('');
    
    Object.entries(byCategory).sort((a, b) => a[0].localeCompare(b[0])).forEach(([category, temps]) => {
      console.log(`📁 ${category} (${temps.length} templates)`);
      temps.slice(0, 3).forEach(t => {
        const clauseData = typeof t.clauses === 'string' ? JSON.parse(t.clauses) : t.clauses;
        const clauseCount = Array.isArray(clauseData) ? clauseData.length : 0;
        console.log(`   • ${t.name} - ${clauseCount} clauses`);
      });
      if (temps.length > 3) {
        console.log(`   ... and ${temps.length - 3} more`);
      }
      console.log('');
    });
    
    console.log('');
    console.log('✅ ALL these categories should be visible in Canvas!');
    console.log('');
    console.log('If you only see "Web Development":');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Try refreshing the page (Cmd+R)');
    console.log('3. Clear browser cache');
    console.log('4. Check Network tab to see if templates are loading');
    console.log('');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

diagnostic();
