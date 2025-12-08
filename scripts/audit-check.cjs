
console.log('Hello from Audit Script');
const fs = require('fs');
const path = require('path');

const CRITICAL_FILES = [
  'App.tsx',
  'screens/LoginScreen.tsx',
  'screens/DashboardScreen.tsx',
  'screens/CanvasScreen.tsx',
  'services/industryData.ts',
  'services/geminiService.ts',
  'services/pdfService.ts',
  'context/AuthContext.tsx',
  'supabase/functions/generate-document/index.ts'
];

const INDUSTRIES = ['Plumber', 'Mechanic', 'Catering', 'Carpenter', 'Construction'];

function checkFiles() {
  console.log('🔍 Starting Comprehensive Audit...\n');
  let errors = 0;

  // 1. File Existence Check
  console.log('1️⃣  Checking Critical Files:');
  CRITICAL_FILES.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ Found ${file}`);
    } else {
      console.error(`  ❌ MISSING ${file}`);
      errors++;
    }
  });

  // 2. Industry Data Check
  console.log('\n2️⃣  Checking Industry Data Integrity:');
  const industryData = fs.readFileSync('services/industryData.ts', 'utf8');
  let missingIndustries = 0;
  INDUSTRIES.forEach(ind => {
    if (industryData.includes(ind)) {
      console.log(`  ✅ Industry defined: ${ind}`);
    } else {
      console.error(`  ❌ Missing definition for: ${ind}`);
      missingIndustries++;
    }
  });
  if (missingIndustries > 0) errors++;

  // 3. Google API / Edge Function Check
  console.log('\n3️⃣  Checking Google API Integration:');
  const geminiService = fs.readFileSync('services/geminiService.ts', 'utf8');
  if (geminiService.includes('generateDocumentViaEdgeFunction')) {
    console.log('  ✅ Client uses Secure Edge Function');
  } else {
    console.error('  ❌ Client might be exposing API keys!');
    errors++;
  }

  const edgeFunction = fs.readFileSync('supabase/functions/generate-document/index.ts', 'utf8');
  if (edgeFunction.includes('Deno.env.get(\'GENAI_API_KEY\')')) {
    console.log('  ✅ Edge Function uses Secure Env Var');
  } else {
    console.error('  ❌ Edge Function might be hardcoding keys!');
    errors++;
  }

  // 4. Sign Out Logic Check
  console.log('\n4️⃣  Checking Sign Out Logic:');
  const appTsx = fs.readFileSync('App.tsx', 'utf8');
  if (appTsx.includes('window.location.href = \'/\'') && appTsx.includes('localStorage.clear()')) {
    console.log('  ✅ Sign Out forces clean reload');
  } else if (appTsx.includes('window.location.href = \'/\'')) {
     console.log('  ✅ Sign Out forces navigation (Good)');
  } else {
    console.warn('  ⚠️ Sign Out logic might be weak (check App.tsx)');
  }

  // 5. PDF Service Check
  console.log('\n5️⃣  Checking PDF Service:');
  const pdfService = fs.readFileSync('services/pdfService.ts', 'utf8');
  if (pdfService.includes('html2pdf') || pdfService.includes('jspdf')) {
    console.log('  ✅ PDF Generation library present');
  } else {
    console.error('  ❌ PDF Generation library missing!');
    errors++;
  }

  console.log('\n-----------------------------------');
  if (errors === 0) {
    console.log('🎉 AUDIT PASSED: Core systems are intact.');
  } else {
    console.error(`⚠️ AUDIT FAILED: Found ${errors} critical issues.`);
  }
}

checkFiles();
