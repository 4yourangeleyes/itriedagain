/**
 * Quick Edge Function Test
 * Tests if the generate-document Edge Function is working correctly
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fopyamyrykwtlwgefxuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunction() {
  console.log('\n🧪 Testing generate-document Edge Function\n');

  try {
    console.log('📤 Sending request to Edge Function...');
    const { data, error } = await supabase.functions.invoke('generate-document', {
      body: {
        prompt: 'Fixed toilet valve for R50 labor, 2 hours at 80/hr, drove 20km for service.',
        docType: 'INVOICE',
        clientName: 'John Smith',
        businessName: 'Plumbing Co',
        industry: 'Plumber',
      },
    });

    if (error) {
      console.error('❌ Error from Edge Function:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('\n✅ Edge Function responded successfully!\n');
    console.log('📦 Response data:\n');
    console.log(JSON.stringify(data, null, 2));

    // Validate response structure
    if (data.items && Array.isArray(data.items)) {
      console.log(`\n✅ Response has ${data.items.length} items`);
      data.items.forEach((item: any, idx: number) => {
        console.log(`\n  Item ${idx + 1}:`);
        console.log(`    Description: ${item.description}`);
        console.log(`    Quantity: ${item.quantity} ${item.unitType}`);
        console.log(`    Price: R${item.price}`);
      });
    } else {
      console.warn('⚠️ Response missing items array or items is not an array');
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testEdgeFunction();
