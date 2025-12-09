/**
 * Chat Feature Test - Direct Function Testing
 * Tests the napkin sketch -> items generation workflow
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fopyamyrykwtlwgefxuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simulates generateDocumentContent from geminiService.ts
async function generateDocumentContent(
  prompt: string,
  docType: string,
  clientName: string,
  businessName: string
) {
  console.log('🔄 Calling Edge Function with:');
  console.log(`   Prompt: "${prompt}"`);
  console.log(`   DocType: ${docType}`);
  console.log(`   Client: ${clientName}`);
  console.log(`   Business: ${businessName}`);

  // Convert DocType enum to API string
  let apiDocType = 'INVOICE';
  if (docType === 'Contract') {
    apiDocType = 'CONTRACT';
  } else if (docType === 'HR Document') {
    apiDocType = 'HRDOC';
  }

  const { data, error } = await supabase.functions.invoke('generate-document', {
    body: {
      prompt,
      docType: apiDocType,
      clientName,
      businessName,
      industry: 'General',
    },
  });

  if (error) {
    throw new Error(`Edge Function error: ${JSON.stringify(error)}`);
  }

  return data;
}

// Simulates processNapkinSketch from ChatScreen.tsx
async function simulateNapkinSketch(napkinText: string, clientName: string, companyName: string) {
  console.log('\n📝 Processing napkin sketch...');
  console.log(`   Input: "${napkinText}"`);

  try {
    const result = await generateDocumentContent(napkinText, 'Invoice', clientName, companyName);

    console.log('\n✅ AI Response received:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Items: ${result.items?.length || 0}`);

    if (result && result.items && Array.isArray(result.items)) {
      const newItems = result.items.map((i: any) => ({
        ...i,
        id: Math.random().toString(),
        unitType: i.unitType || 'ea',
      }));

      console.log('\n📦 Converted items for JobItems state:');
      newItems.forEach((item: any, idx: number) => {
        console.log(`   [${idx + 1}] ${item.description}`);
        console.log(`       ID: ${item.id.substring(0, 8)}...`);
        console.log(`       Qty: ${item.quantity} ${item.unitType} @ R${item.price}`);
      });

      return { success: true, items: newItems, title: result.title };
    } else {
      console.warn('⚠️ No items returned from AI');
      return { success: false, error: 'No items in response' };
    }
  } catch (e) {
    console.error('❌ Error:', e instanceof Error ? e.message : e);
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// Test scenarios
async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         CHAT FEATURE - NAPKIN SKETCH TESTS            ║
╚════════════════════════════════════════════════════════╝
`);

  const tests = [
    {
      name: 'Test 1: Plumbing Service',
      napkin: 'Fixed toilet valve for 50 bucks, 2 hours labor at 80/hr, drove 20km',
      client: 'John Smith',
      company: 'Smith Plumbing',
    },
    {
      name: 'Test 2: Mechanic Service',
      napkin: 'Oil change R450, new air filter R85, and 1.5 hours labor at 500/hr',
      client: 'Mrs Johnson',
      company: 'Auto Repairs',
    },
    {
      name: 'Test 3: Catering Event',
      napkin: '50 people at 350 per head buffet, 2 waiters for 5 hours at 250/hr',
      client: 'ABC Corp',
      company: 'Elite Catering',
    },
  ];

  let passCount = 0;
  let failCount = 0;

  for (const test of tests) {
    console.log(`\n${'='.repeat(56)}`);
    console.log(test.name);
    console.log('='.repeat(56));

    const result = await simulateNapkinSketch(test.napkin, test.client, test.company);

    if (result.success && result.items && result.items.length > 0) {
      console.log(`\n✅ PASS: Generated ${result.items.length} items`);
      passCount++;
    } else {
      console.log(`\n❌ FAIL: ${result.error}`);
      failCount++;
    }
  }

  console.log(`\n${'='.repeat(56)}`);
  console.log(`
SUMMARY
───────────────────────────────────────────────────────
Passed: ${passCount}/${tests.length}
Failed: ${failCount}/${tests.length}

${failCount === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests failed. Check logs above.'}
`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
