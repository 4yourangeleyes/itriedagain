/**
 * Full Workflow Integration Test
 * Tests: chat → template generation → document creation → canvas → save → client association
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fopyamyrykwtlwgefxuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  data?: Record<string, unknown>;
}

const results: TestResult[] = [];

async function logTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    console.log(`\n📋 ${name}`);
    await fn();
    const duration = Date.now() - start;
    results.push({ name, status: 'PASS', duration });
    console.log(`✅ PASS (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const msg = error instanceof Error ? error.message : String(error);
    results.push({ name, status: 'FAIL', duration, error: msg });
    console.error(`❌ FAIL: ${msg}`);
  }
}

async function testSignUp() {
  const email = `test-agent-${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('No user created');

  console.log(`  Created user: ${data.user.id}`);
  return { userId: data.user.id, email };
}

async function testCreateClient(userId: string) {
  const clientData = {
    user_id: userId,
    business_name: `Test Client ${Date.now()}`,
    email: `client-${Date.now()}@example.com`,
    phone: '555-1234',
    address: '123 Test St, Test City',
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('No client created');

  console.log(`  Created client: ${data.id}`);
  return data;
}

async function testGenerateTemplate(clientName: string, businessName: string) {
  const prompt = `Create invoice template blocks for client: ${clientName}. Include: 2 x Widget A ($10 each), 1 x Service Fee ($50). Include invoice metadata (invoice_number, date, due_date 30d).`;

  const { data, error } = await supabase.functions.invoke('generate-document', {
    body: {
      prompt,
      docType: 'INVOICE',
      clientName,
      businessName,
      industry: 'Test Industry',
    },
  });

  if (error) throw error;
  if (!data) throw new Error('No template generated');

  console.log(`  Generated template with ${data.items?.length || 0} items`);
  return data;
}

async function testCreateDocument(userId: string, clientId: string, templateData: Record<string, unknown>) {
  const docData = {
    user_id: userId,
    client_id: clientId,
    title: templateData.title || 'Test Invoice',
    doc_type: 'INVOICE',
    status: 'Draft',
    theme: 'swiss',
    currency: '$',
    subtotal: 0,
    tax_total: 0,
    total: 0,
  };

  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert(docData)
    .select()
    .single();

  if (docError) throw docError;
  if (!document) throw new Error('No document created');

  // Insert invoice items
  const items = (templateData.items as Array<Record<string, unknown>>) || [];
  if (items.length > 0) {
    const itemsData = items.map((item, idx) => ({
      document_id: document.id,
      description: item.description,
      quantity: item.quantity || 1,
      unit_type: item.unitType || 'ea',
      price: item.price || 0,
      sort_order: idx,
    }));

    const { error: itemError } = await supabase
      .from('invoice_items')
      .insert(itemsData);

    if (itemError) throw itemError;
  }

  console.log(`  Created document: ${document.id}`);
  return document;
}

async function testUpdateDocument(docId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', docId)
    .select()
    .single();

  if (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(`Update failed: ${errorMsg}`);
  }
  if (!data) throw new Error('Document not updated');

  console.log(`  Updated document: ${docId}`);
  return data;
}

async function testRetrieveDocument(docId: string) {
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .single();

  if (docError) throw docError;
  if (!doc) throw new Error('Document not found');

  const { data: items, error: itemError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('document_id', docId)
    .order('sort_order');

  if (itemError) throw itemError;

  console.log(`  Retrieved document with ${items?.length || 0} items`);
  return { document: doc, items: items || [] };
}

async function testVerifyCanvasData(docId: string) {
  // Canvas data would be stored in the document (serialized in a canvas_data column or similar)
  // For now, we verify the document has proper structure
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .single();

  if (error) throw error;
  if (!doc) throw new Error('Document not found');

  // Verify essential canvas fields
  if (!doc.id || !doc.title || !doc.doc_type) {
    throw new Error('Document missing required canvas fields');
  }

  console.log(`  Canvas data verified for document: ${docId}`);
  return doc;
}

async function testCleanup(userId: string, clientId: string, docId: string) {
  // Soft delete document
  const { error: delError } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', docId);

  if (delError) throw delError;

  // Delete client
  const { error: clientError } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (clientError) throw clientError;

  // Delete user auth
  // Note: This requires admin API; we'll skip for now to avoid permission errors
  console.log(`  Marked document as deleted and removed client`);
}

async function runFullWorkflow() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           FULL WORKFLOW INTEGRATION TEST                    ║
║  Chat → Template → Document → Canvas → Save → Cleanup       ║
╚══════════════════════════════════════════════════════════════╝
`);

  let userId: string | null = null;
  let clientId: string | null = null;
  let docId: string | null = null;
  let templateData: Record<string, unknown> | null = null;

  // Step 1: User Sign Up
  await logTest('Step 1: User Sign Up', async () => {
    const result = await testSignUp();
    userId = result.userId;
  });

  // Step 2: Create Test Client
  await logTest('Step 2: Create Test Client', async () => {
    if (!userId) throw new Error('No user ID');
    const client = await testCreateClient(userId);
    clientId = client.id;
  });

  // Step 3: Generate Template via AI (Chat → Template)
  await logTest('Step 3: AI Template Generation (Chat → Template)', async () => {
    if (!userId) throw new Error('No user ID');
    templateData = await testGenerateTemplate(
      `Test Client ${Date.now()}`,
      'Test Business'
    );

    // Verify template structure
    if (!templateData?.items || !Array.isArray(templateData.items)) {
      throw new Error('Template missing items array');
    }
    if (templateData.items.length === 0) {
      throw new Error('Template has no items');
    }

    // Log template for inspection
    results[results.length - 1].data = {
      template_title: templateData.title,
      template_items_count: templateData.items.length,
      first_item: templateData.items[0],
    };
  });

  // Step 4: Create Document in Database (Template → Document)
  await logTest('Step 4: Create Document (Template → Database)', async () => {
    if (!userId || !clientId || !templateData) {
      throw new Error('Missing prerequisites');
    }
    const document = await testCreateDocument(userId, clientId, templateData);
    docId = document.id;

    results[results.length - 1].data = {
      document_id: document.id,
      document_title: document.title,
      document_type: document.doc_type,
      client_association: `client_id=${document.client_id}`,
    };
  });

  // Step 5: Update Document (Canvas Editing)
  await logTest('Step 5: Update Document (Canvas Editing)', async () => {
    if (!docId) throw new Error('No document ID');
    const updated = await testUpdateDocument(docId, {
      status: 'Sent',
      notes: 'Updated via canvas editor',
    });

    results[results.length - 1].data = {
      updated_at: updated.updated_at,
      status: updated.status,
    };
  });

  // Step 6: Retrieve Document (Canvas Load)
  await logTest('Step 6: Retrieve Document (Canvas Load)', async () => {
    if (!docId) throw new Error('No document ID');
    const { document, items } = await testRetrieveDocument(docId);

    results[results.length - 1].data = {
      document_id: document.id,
      client_id: document.client_id,
      items_count: items.length,
      items_sample: items.slice(0, 2),
    };
  });

  // Step 7: Verify Canvas Data Integrity
  await logTest('Step 7: Verify Canvas Data Integrity', async () => {
    if (!docId) throw new Error('No document ID');
    const verified = await testVerifyCanvasData(docId);

    results[results.length - 1].data = {
      document_id: verified.id,
      title: verified.title,
      doc_type: verified.doc_type,
      theme: verified.theme,
    };
  });

  // Step 8: Cleanup
  await logTest('Step 8: Cleanup Test Data', async () => {
    if (!userId || !clientId || !docId) {
      throw new Error('Missing IDs for cleanup');
    }
    await testCleanup(userId, clientId, docId);
  });

  // Print Summary
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                             ║
╚══════════════════════════════════════════════════════════════╝
`);

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`
Tests Passed: ${passed}/${total}
Tests Failed: ${failed}/${total}
Total Time:   ${totalTime}ms

Detailed Results:
─────────────────────────────────────────────────────────────`);

  results.forEach((r, idx) => {
    const statusIcon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${idx + 1}. ${statusIcon} ${r.name} (${r.duration}ms)`);
    if (r.error) {
      console.log(`   Error: ${r.error}`);
    }
    if (r.data) {
      console.log(`   Data: ${JSON.stringify(r.data, null, 2)}`);
    }
  });

  console.log(`
─────────────────────────────────────────────────────────────`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Full workflow is operational.\n');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. See details above.\n`);
    process.exit(1);
  }
}

// Run the test
runFullWorkflow().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
