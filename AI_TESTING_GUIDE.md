# AI Testing Guide

## Test Scenarios for Enhanced AI Functionality

### Test 1: Basic Invoice Generation (Plumber)
**Input:** "I replaced a geyser and fixed bathroom tiles for John Smith"

**Expected Output:**
- Client detected: "John Smith"
- Doc type: INVOICE
- Items should include:
  - Geyser installation (R3400-R5000 range)
  - Tiling work (R320/sqm estimate)
  - Labour hours
- Prices should match template blocks from plumbingData.ts

**Validation:**
```javascript
// Check response structure
{
  "title": "Geyser & Tiling Work - John Smith",
  "items": [
    {"description": "Geyser Kwikot 150L installation", "quantity": 1, "unitType": "ea", "price": 3400-5000},
    {"description": "Bathroom tiling", "quantity": 5, "unitType": "sqm", "price": 320},
    {"description": "Plumber labour", "quantity": 3, "unitType": "hrs", "price": 450}
  ]
}
```

---

### Test 2: Mechanic Invoice
**Input:** "Brake job and oil change for Mrs Johnson's Toyota"

**Expected Output:**
- Client: "Mrs Johnson"
- Items from mechanicData.ts templates:
  - Brake pads (R1200-R1800)
  - Oil change (R450-R800)
  - Labour (R550/hr)

**Validation:**
- Prices should match MECHANIC_TEMPLATES
- unitType should be 'ea' for parts, 'hrs' for labour

---

### Test 3: Catering Contract
**Input:** "Create a contract for wedding catering at Sandton Hotel, 100 guests"

**Expected Output:**
- Doc type: CONTRACT
- Should generate clauses:
  - Scope of Work (catering for 100 guests)
  - Payment Terms (deposit + balance)
  - Cancellation Policy
- Pricing should reference cateringData.ts (R350/person buffet)

---

### Test 4: Multi-turn Conversation
**Conversation:**
1. User: "I did a bathroom renovation for Smith"
2. AI: *generates items*
3. User: "Add a shower installation too"
4. AI: *adds shower items to existing list*
5. User: "Make the prices 10% cheaper"
6. AI: *adjusts all prices down 10%*

**Validation:**
- AI should remember previous context
- conversationHistory should be passed correctly
- Items should accumulate, not replace

---

### Test 5: Template Block Matching
**Input:** "Standard brake service"

**Expected Behavior:**
- AI should recognize "brake service" matches "Braking System" template
- Should pull exact prices from template:
  - Brake Pads Set (Front - Ceramic): R1200
  - Brake Disc Resurfacing: R800
  - Brake Fluid Flush: R350

**Validation:**
```javascript
// templateContext should be passed to AI:
"Braking System (Brakes):
  - Brake Pads Set (Front - Ceramic): R1200 (1 set)
  - Brake Disc Resurfacing (Front): R800 (1 set)"
```

---

### Test 6: Pricing Intelligence
**Input:** "Labour for 5 hours fixing plumbing leaks"

**Expected Output:**
- Should calculate: 5 × R450/hr = R2250
- unitType should be 'hrs'
- Description should be professional

---

### Test 7: South African Context
**Input:** "Install new toilet"

**Expected Output:**
- Currency should be Rand (R)
- Pricing should reflect SA market (not USD/EUR)
- VAT mention (15%)
- Toilet prices R550-R3500 range (from templates)

---

### Test 8: Voice Input
**Test:**
1. Click microphone button
2. Speak: "I need an invoice for bathroom work"
3. AI should process speech correctly

**Validation:**
- Speech recognition works
- Text appears in input field
- AI processes spoken input same as typed

---

### Test 9: Error Handling
**Input:** "asdfjkl; random gibberish"

**Expected:**
- AI should respond gracefully
- Ask for clarification
- Don't crash or return malformed JSON

---

### Test 10: Document Creation Flow
**Full Workflow:**
1. User describes work
2. AI generates items
3. User reviews in chat
4. User clicks "Create Document"
5. Document appears on Canvas with:
   - Correct totals
   - Correct VAT (15%)
   - All items present
   - Professional formatting

---

## Manual Testing Checklist

### Pre-Deployment
- [ ] Edge function deployed to Supabase
- [ ] GENAI_API_KEY environment variable set
- [ ] Conversations table created in database
- [ ] Frontend build succeeds
- [ ] No TypeScript errors

### Functional Tests
- [ ] Test 1: Basic invoice generation works
- [ ] Test 2: Mechanic invoice uses correct prices
- [ ] Test 3: Contract generation includes clauses
- [ ] Test 4: Multi-turn conversation maintains context
- [ ] Test 5: Template blocks are matched correctly
- [ ] Test 6: Pricing calculations are accurate
- [ ] Test 7: South African Rand used throughout
- [ ] Test 8: Voice input captures speech
- [ ] Test 9: Error handling works gracefully
- [ ] Test 10: End-to-end document creation succeeds

### Edge Cases
- [ ] Empty input is rejected
- [ ] Very long input (>1000 chars) is handled
- [ ] Special characters in client names work
- [ ] Multiple clients in one message detected
- [ ] Numbers and prices extracted correctly
- [ ] Template with no items handled
- [ ] Network error handled gracefully

### Performance
- [ ] AI response time < 5 seconds
- [ ] Chat scrolls smoothly
- [ ] No memory leaks after 20+ messages
- [ ] Voice recognition doesn't lag

### UI/UX
- [ ] Messages display correctly
- [ ] Timestamps are accurate
- [ ] Items preview looks good
- [ ] Mobile responsive
- [ ] Keyboard shortcuts work (Enter to send)
- [ ] Loading states clear
- [ ] Success/error feedback clear

---

## Example Test Script (Run in Browser Console)

```javascript
// Test AI call directly
const testAI = async () => {
  try {
    const response = await fetch('https://fopyamyrykwtlwgefxuq.supabase.co/functions/v1/generate-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY'
      },
      body: JSON.stringify({
        prompt: 'I replaced a geyser for John Smith',
        docType: 'INVOICE',
        clientName: 'John Smith',
        businessName: 'Test Plumbing Co',
        industry: 'Plumber',
        templateContext: 'Geyser Installation: R3400 (1 ea)'
      })
    });
    
    const data = await response.json();
    console.log('AI Response:', data);
    
    // Validate
    if (data.items && data.items.length > 0) {
      console.log('✅ Items generated:', data.items.length);
      console.log('✅ First item:', data.items[0]);
    } else {
      console.log('❌ No items generated');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAI();
```

---

## Success Criteria

✅ **PASS** if:
- All 10 test scenarios produce expected results
- Edge cases handled gracefully
- Performance meets targets (<5s AI response)
- No critical bugs in UI
- South African pricing/context maintained

❌ **FAIL** if:
- AI produces malformed JSON
- Prices are wildly inaccurate (>50% off templates)
- Conversation context not maintained
- Critical bugs in document creation
- Voice input non-functional
