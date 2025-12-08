/**
 * Check what templates exist in the database
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

async function checkTemplates() {
  try {
    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'design@northcellstudios.com',
      password: 'samurai01'
    });
    
    if (signInError) throw signInError;
    
    console.log('✅ Signed in as:', signInData.user.email);
    console.log('');
    
    // Get all templates
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', signInData.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`📊 Total templates found: ${templates?.length || 0}`);
    console.log('');
    
    if (templates && templates.length > 0) {
      // Group by category
      const byCategory: Record<string, any[]> = {};
      
      templates.forEach(t => {
        const cat = t.category || 'Uncategorized';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(t);
      });
      
      console.log('📂 Templates by Category:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      Object.entries(byCategory).forEach(([category, temps]) => {
        console.log(`\n${category} (${temps.length}):`);
        temps.forEach(t => {
          console.log(`  • ${t.name}`);
          console.log(`    Type: ${t.doc_type || 'N/A'}`);
          console.log(`    Contract Type: ${t.contract_type || 'N/A'}`);
          
          // Check if clauses is a string or already parsed
          let clauseData;
          if (typeof t.clauses === 'string') {
            try {
              clauseData = JSON.parse(t.clauses);
            } catch (e) {
              clauseData = t.clauses;
            }
          } else {
            clauseData = t.clauses;
          }
          
          if (Array.isArray(clauseData)) {
            console.log(`    Clauses: ${clauseData.length}`);
          } else if (clauseData) {
            console.log(`    Clause data: ${typeof clauseData}`);
          }
          console.log('');
        });
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkTemplates();
