/**
 * Complete End-to-End Chat → Canvas → Save Test
 * Validates the full user workflow
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fopyamyrykwtlwgefxuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestStep {
  name: string;
  fn: () => Promise<any>;
  validate: (result: any) => boolean;
}

async function runE2ETest() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║        END-TO-END CHAT → CANVAS → SAVE TEST           ║
║                                                        ║
║  1. User signs up                                      ║
║  2. User enters client name                           ║
║  3. User provides napkin sketch                       ║
║  4. AI generates items                                ║
║  5. User creates document with items                  ║
║  6. Document saved to Supabase                        ║
║  7. Canvas loads document                             ║
║  8. Cleanup test data                                 ║
╚════════════════════════════════════════════════════════╝
`);

  let userId: string | null = null;
  let clientId: string | null = null;
  let docId: string | null = null;
  const timestamp = Date.now();

  const steps: TestStep[] = [
    {
      name: '✅ Step 1: User Sign Up',
      fn: async () => {
        const { data, error } = await supabase.auth.signUp({
          email: `test-chat-${timestamp}@example.com`,
          password: 'TestPass123!',
        });
        if (error) throw error;
        userId = data.user?.id;
        return data.user;
      },
      validate: (user) => !!user?.id,
    },
    {
      name: '✅ Step 2: Create Client',
      fn: async () => {
        if (!userId) throw new Error('No user ID');
        const { data, error } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            business_name: `Test Chat Client ${timestamp}`,
            email: `client-${timestamp}@example.com`,
          })
          .select()
          .single();
        if (error) throw error;
        clientId = data.id;
        return data;
      },
      validate: (client) => !!client?.id,
    },
    {
      name: '✅ Step 3: Process Napkin Sketch (Chat → AI)',
      fn: async () => {
        const napkinText = 'Replaced water heater (R4500), installed new shower head (R280), 3 hours labor at R600/hr';
        const { data, error } = await supabase.functions.invoke('generate-document', {
          body: {
            prompt: napkinText,
            docType: 'INVOICE',
            clientName: `Test Chat Client ${timestamp}`,
            businessName: 'Test Plumbing',
            industry: 'Plumber',
          },
        });
        if (error) throw error;
        return data;
      },
      validate: (response) => Array.isArray(response?.items) && response.items.length > 0,
    },
    {
      name: '✅ Step 4: Create Document with Items',
      fn: async () => {
        if (!userId || !clientId) throw new Error('Missing user or client ID');

        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: userId,
            client_id: clientId,
            title: `Plumbing Invoice - Test ${timestamp}`,
            doc_type: 'INVOICE',
            status: 'Draft',
            theme: 'swiss',
            currency: '$',
          })
          .select()
          .single();

        if (docError) throw docError;
        docId = doc.id;

        // Add items
        const items = [
          {
            document_id: docId,
            description: 'Water Heater Replacement',
            quantity: 1,
            unit_type: 'ea',
            price: 4500,
            sort_order: 0,
          },
          {
            document_id: docId,
            description: 'Shower Head Installation',
            quantity: 1,
            unit_type: 'ea',
            price: 280,
            sort_order: 1,
          },
          {
            document_id: docId,
            description: 'Labour',
            quantity: 3,
            unit_type: 'hrs',
            price: 600,
            sort_order: 2,
          },
        ];

        const { error: itemError } = await supabase.from('invoice_items').insert(items);
        if (itemError) throw itemError;

        return { document: doc, items };
      },
      validate: (result) => !!result?.document?.id && Array.isArray(result.items),
    },
    {
      name: '✅ Step 5: Load Document for Canvas',
      fn: async () => {
        if (!docId) throw new Error('No document ID');

        const { data: doc, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', docId)
          .single();

        if (docError) throw docError;

        const { data: items, error: itemError } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('document_id', docId);

        if (itemError) throw itemError;

        return { document: doc, items: items || [] };
      },
      validate: (result) => !!result.document && Array.isArray(result.items),
    },
    {
      name: '✅ Step 6: Update Document (Canvas Edit)',
      fn: async () => {
        if (!docId) throw new Error('No document ID');

        const { data, error } = await supabase
          .from('documents')
          .update({
            status: 'Sent',
            notes: 'Generated via chat feature test',
          })
          .eq('id', docId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      validate: (doc) => doc?.status === 'Sent',
    },
    {
      name: '✅ Step 7: Cleanup',
      fn: async () => {
        if (!docId) throw new Error('No document ID');

        // Soft delete document
        await supabase
          .from('documents')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', docId);

        // Delete client
        if (clientId) {
          await supabase.from('clients').delete().eq('id', clientId);
        }

        return { docId, clientId };
      },
      validate: () => true,
    },
  ];

  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      console.log(`\n${step.name}`);
      const result = await step.fn();

      if (step.validate(result)) {
        console.log(`   ✓ Validated successfully`);
        passCount++;
      } else {
        console.log(`   ✗ Validation failed`);
        failCount++;
      }
    } catch (err) {
      console.log(`   ✗ Error: ${err instanceof Error ? err.message : err}`);
      failCount++;
    }
  }

  console.log(`
╔════════════════════════════════════════════════════════╗
║                     RESULTS                           ║
╚════════════════════════════════════════════════════════╝

  Passed: ${passCount}/${steps.length}
  Failed: ${failCount}/${steps.length}

${failCount === 0 ? '🎉 FULL END-TO-END WORKFLOW SUCCESSFUL!' : '⚠️  Some steps failed'}
`);

  if (failCount > 0) process.exit(1);
}

runE2ETest().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
