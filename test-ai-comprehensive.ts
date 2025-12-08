/**
 * Comprehensive AI Testing Script
 * Tests AI document generation with real scenarios
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fopyamyrykwtlwgefxuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestScenario {
  name: string;
  prompt: string;
  docType: 'INVOICE' | 'CONTRACT';
  clientName: string;
  businessName: string;
  industry: string;
  expectedItems?: number; // minimum expected items
  expectedPriceRange?: { min: number; max: number };
  templateContext?: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  // Test 1: Plumber - Geyser & Tiling
  {
    name: 'Plumber: Geyser Replacement & Bathroom Tiling',
    prompt: 'I replaced a Kwikot 150L geyser and retiled the bathroom floor (12 square meters) for John Smith. Also installed new copper pipes and a drip tray.',
    docType: 'INVOICE',
    clientName: 'John Smith',
    businessName: 'Quality Plumbing Services',
    industry: 'Plumber',
    expectedItems: 4,
    expectedPriceRange: { min: 5000, max: 12000 },
    templateContext: `Geyser Installation:
  - Geyser Kwikot 150L: R3400 (1 ea)
  - Drip Tray: R580 (1 ea)
  - Labour: R650 (1 ea)
Tiling:
  - Floor tiles removal: R200 (1 sqm)
  - Floor tiling installation: R320 (1 sqm)`
  },
  
  // Test 2: Mechanic - Brake Job
  {
    name: 'Mechanic: Complete Brake Service',
    prompt: 'I did a full brake service for Mrs Johnson\'s Toyota Corolla. Replaced front brake pads with ceramic ones, resurfaced both front discs, flushed the brake fluid, and did a diagnostic scan to clear the brake warning light.',
    docType: 'INVOICE',
    clientName: 'Mrs Johnson',
    businessName: 'Elite Auto Repairs',
    industry: 'Mechanic',
    expectedItems: 4,
    expectedPriceRange: { min: 2500, max: 5000 },
    templateContext: `Braking System:
  - Brake Pads Set (Front - Ceramic): R1200 (1 set)
  - Brake Disc Resurfacing: R800 (1 set)
  - Brake Fluid Flush: R350 (1 service)
Diagnostics:
  - Diagnostic Scan: R550 (1 service)`
  },
  
  // Test 3: Catering - Wedding Event
  {
    name: 'Catering: Wedding Reception',
    prompt: 'We catered a wedding at Sandton Convention Centre for 120 guests. Menu included canapes on arrival, main course buffet with 3 proteins, sides, and dessert station. We provided 3 waiters for 6 hours and hired tablecloths and crockery.',
    docType: 'INVOICE',
    clientName: 'Sarah & David Wedding',
    businessName: 'Elegant Events Catering',
    industry: 'Catering',
    expectedItems: 5,
    expectedPriceRange: { min: 35000, max: 60000 },
    templateContext: `Catering Packages:
  - Buffet Package (Premium): R450 (per person)
  - Canapes (6 varieties): R85 (per person)
Staffing:
  - Waiter Service: R280 (per hour)
Equipment:
  - Tablecloth Hire: R35 (per item)
  - Crockery Hire: R25 (per person)`
  },
  
  // Test 4: Contract - Bathroom Renovation
  {
    name: 'Contract: Complete Bathroom Renovation',
    prompt: 'Create a service contract for a full bathroom renovation project at 24 Oak Street, Sandton for Mr & Mrs Patel. Scope includes: removing old fixtures, installing new toilet, basin, shower, retiling walls and floor, new lighting, waterproofing. Project duration 3 weeks. Payment terms: 40% deposit, 30% mid-project, 30% on completion. Total project value R85,000.',
    docType: 'CONTRACT',
    clientName: 'Mr & Mrs Patel',
    businessName: 'Premium Renovations SA',
    industry: 'Plumber',
    expectedItems: 8, // clauses
    expectedPriceRange: { min: 80000, max: 90000 }
  },
  
  // Test 5: Plumber - Emergency Call
  {
    name: 'Plumber: Emergency Pipe Burst',
    prompt: 'Emergency call-out at 2am for burst pipe in kitchen. Replaced damaged 22mm copper pipe section, installed new isolation valves, cleaned up water damage. 4 hours labour including call-out fee.',
    docType: 'INVOICE',
    clientName: 'Emergency Services - 45 River Road',
    businessName: 'Quality Plumbing Services',
    industry: 'Plumber',
    expectedItems: 3,
    expectedPriceRange: { min: 2500, max: 5000 }
  },
  
  // Test 6: Mechanic - Major Service
  {
    name: 'Mechanic: Major Service Package',
    prompt: 'Major service for BMW 320i at 80,000km. Oil and filter change with synthetic oil, air filter, cabin filter, spark plugs, brake inspection, coolant top-up, battery test, and full diagnostic scan.',
    docType: 'INVOICE',
    clientName: 'James Peterson',
    businessName: 'Elite Auto Repairs',
    industry: 'Mechanic',
    expectedItems: 7,
    expectedPriceRange: { min: 4500, max: 8000 }
  }
];

interface AIResponse {
  title?: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitType: string;
    price: number;
  }>;
  clauses?: Array<{
    title: string;
    content: string;
  }>;
  bodyText?: string;
}

async function testAIGeneration(scenario: TestScenario): Promise<{
  success: boolean;
  response?: AIResponse;
  error?: string;
  duration: number;
}> {
  const startTime = Date.now();
  
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 Testing: ${scenario.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Prompt: "${scenario.prompt}"`);
    console.log(`Industry: ${scenario.industry}`);
    console.log(`Expected items: ${scenario.expectedItems || 'N/A'}`);
    
    const { data, error } = await supabase.functions.invoke('generate-document', {
      body: {
        prompt: scenario.prompt,
        docType: scenario.docType,
        clientName: scenario.clientName,
        businessName: scenario.businessName,
        industry: scenario.industry,
        templateContext: scenario.templateContext
      }
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message, duration };
    }

    console.log('\n✅ AI Response received in', duration, 'ms');
    console.log('\n📄 Generated Output:');
    console.log(JSON.stringify(data, null, 2));

    // Validate response
    const validation = validateResponse(data, scenario);
    console.log('\n🔍 Validation Results:');
    validation.forEach(v => {
      console.log(`  ${v.passed ? '✅' : '❌'} ${v.check}: ${v.message}`);
    });

    const allPassed = validation.every(v => v.passed);
    
    return {
      success: allPassed,
      response: data,
      duration
    };

  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Exception:', err.message);
    return { success: false, error: err.message, duration };
  }
}

interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
}

function validateResponse(response: AIResponse, scenario: TestScenario): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check title exists
  results.push({
    check: 'Title exists',
    passed: !!response.title,
    message: response.title ? `"${response.title}"` : 'Missing title'
  });

  if (scenario.docType === 'INVOICE') {
    // Check items array
    results.push({
      check: 'Items array exists',
      passed: Array.isArray(response.items),
      message: Array.isArray(response.items) ? `${response.items.length} items` : 'No items array'
    });

    if (Array.isArray(response.items)) {
      // Check minimum items
      results.push({
        check: `Minimum ${scenario.expectedItems || 1} items`,
        passed: response.items.length >= (scenario.expectedItems || 1),
        message: `Has ${response.items.length} items`
      });

      // Check each item structure
      const validItems = response.items.every(item => 
        item.description && 
        typeof item.quantity === 'number' && 
        item.unitType && 
        typeof item.price === 'number'
      );
      results.push({
        check: 'All items have required fields',
        passed: validItems,
        message: validItems ? 'All items valid' : 'Some items missing fields'
      });

      // Check pricing uses Rand
      const usesRand = response.items.every(item => 
        typeof item.price === 'number' && item.price > 0
      );
      results.push({
        check: 'Prices are valid numbers',
        passed: usesRand,
        message: usesRand ? 'All prices valid' : 'Invalid prices found'
      });

      // Calculate total
      const total = response.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      // Check price range if specified
      if (scenario.expectedPriceRange) {
        const inRange = total >= scenario.expectedPriceRange.min && 
                       total <= scenario.expectedPriceRange.max;
        results.push({
          check: 'Total in expected range',
          passed: inRange,
          message: `Total: R${total.toFixed(2)} (expected R${scenario.expectedPriceRange.min}-R${scenario.expectedPriceRange.max})`
        });
      } else {
        results.push({
          check: 'Total calculated',
          passed: total > 0,
          message: `Total: R${total.toFixed(2)}`
        });
      }
    }
  } else if (scenario.docType === 'CONTRACT') {
    // Check clauses array
    results.push({
      check: 'Clauses array exists',
      passed: Array.isArray(response.clauses),
      message: Array.isArray(response.clauses) ? `${response.clauses.length} clauses` : 'No clauses array'
    });

    if (Array.isArray(response.clauses)) {
      // Check minimum clauses
      results.push({
        check: `Minimum ${scenario.expectedItems || 5} clauses`,
        passed: response.clauses.length >= (scenario.expectedItems || 5),
        message: `Has ${response.clauses.length} clauses`
      });

      // Check each clause structure
      const validClauses = response.clauses.every(clause => 
        clause.title && clause.content
      );
      results.push({
        check: 'All clauses have title and content',
        passed: validClauses,
        message: validClauses ? 'All clauses valid' : 'Some clauses missing fields'
      });

      // Check for essential contract clauses
      const titles = response.clauses.map(c => c.title.toLowerCase());
      const hasScope = titles.some(t => t.includes('scope') || t.includes('work'));
      const hasPayment = titles.some(t => t.includes('payment') || t.includes('fee'));
      
      results.push({
        check: 'Has Scope of Work clause',
        passed: hasScope,
        message: hasScope ? 'Scope clause found' : 'Missing scope clause'
      });
      
      results.push({
        check: 'Has Payment Terms clause',
        passed: hasPayment,
        message: hasPayment ? 'Payment clause found' : 'Missing payment clause'
      });
    }
  }

  return results;
}

async function runAllTests() {
  console.log('\n🚀 Starting Comprehensive AI Testing');
  console.log('Testing against live Supabase edge function\n');

  const results: Array<{
    scenario: string;
    success: boolean;
    duration: number;
  }> = [];

  for (const scenario of TEST_SCENARIOS) {
    const result = await testAIGeneration(scenario);
    results.push({
      scenario: scenario.name,
      success: result.success,
      duration: result.duration
    });
    
    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.success ? '✅' : '❌'} ${r.scenario} (${r.duration}ms)`);
  });

  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

  console.log('\n' + '='.repeat(80));
  console.log(`Results: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  console.log(`Average response time: ${Math.round(avgDuration)}ms`);
  console.log('='.repeat(80) + '\n');

  if (passed === total) {
    console.log('🎉 All tests passed! AI is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the output above.');
  }
}

// Run tests
runAllTests().catch(console.error);
