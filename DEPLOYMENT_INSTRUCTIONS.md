# Deployment Instructions

## ✅ Completed Steps

### 1. Edge Function Deployed
The enhanced `generate-document` edge function has been successfully deployed to Supabase.

**What was deployed:**
- Industry-specific AI prompts (Plumber, Mechanic, Catering, Carpenter, Construction)
- South African market pricing guidance (R350-650/hr skilled labour, 15% VAT)
- Template block matching (AI receives top 5 templates with prices)
- Conversation history support for multi-turn refinement
- Separate INVOICE vs CONTRACT generation logic

**Verify in Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/functions
2. Click on `generate-document`
3. Check "Last deployed" timestamp should be recent

---

## ⏳ Pending Steps

### 2. Database Migration (MANUAL)

Since local Supabase isn't running, you need to apply the migration manually via the Dashboard.

**Steps:**
1. Go to: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/sql
2. Click "New Query"
3. Copy the entire SQL from `supabase/migrations/002_conversations.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd+Enter)

**The SQL will create:**
- `conversations` table with columns: id, user_id, document_id, messages (JSONB), doc_type, client_name
- 3 indexes for performance
- 4 RLS policies (view, create, update, delete own conversations)
- Trigger to auto-update `updated_at` timestamp

**Verify the migration:**
```sql
-- Run this to check table exists
SELECT * FROM conversations LIMIT 1;

-- Should return no rows (table is empty) but NO ERROR
```

---

### 3. Environment Variables Check

Ensure the Gemini API key is set in Supabase secrets:

1. Go to: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/settings/functions
2. Check "Secrets" section
3. Verify `GENAI_API_KEY` exists and is valid

**If missing:**
- Click "Add new secret"
- Name: `GENAI_API_KEY`
- Value: Your Google AI Studio API key (from https://aistudio.google.com/app/apikey)

---

## 🧪 Testing Phase

Once database migration is complete, follow **AI_TESTING_GUIDE.md** to test:

### Quick Test (Browser Console)
1. Open your deployed site: https://monumental-axolotl-b1c008.netlify.app
2. Navigate to Chat screen
3. Open browser DevTools (F12)
4. Run this test:

```javascript
// Test 1: Basic AI call
const testMessage = "I replaced a geyser and fixed bathroom tiles for John Smith";

// Send via UI or console
console.log('Testing AI with:', testMessage);
```

### Expected Result:
- AI responds within 5 seconds
- Returns items array with:
  - Geyser installation (R3400-R5000)
  - Tiling work (R320/sqm estimate)
  - Labour (R450/hr)
- Items display in chat bubble with previews
- Total calculates correctly

### Test Checklist:
- [ ] AI responds to basic invoice request
- [ ] Prices match South African market (R currency)
- [ ] Multi-turn conversation maintains context ("add more items")
- [ ] Template blocks provide price guidance
- [ ] Voice input works (microphone button)
- [ ] Document creation from chat works
- [ ] Conversation saves to database

---

## 🚀 Production Deployment

If all tests pass:

### 1. Commit Changes
```bash
git add .
git commit -m "✨ Enhanced AI with prompt engineering and conversational UI

- Added industry-specific prompts (plumber, mechanic, catering, carpenter, construction)
- South African market pricing guidance (R350-650/hr, 15% VAT)
- Template block matching for price consistency
- Conversation memory for multi-turn refinement
- New ChatScreenConversational with message bubbles
- Voice input integration
- Live item preview in chat
- Conversations database table for chat history"
```

### 2. Push to GitHub
```bash
git push origin master
```

### 3. Netlify Auto-Deploy
Netlify will automatically rebuild and deploy:
- Watch at: https://app.netlify.com/sites/monumental-axolotl-b1c008/deploys
- Live site: https://monumental-axolotl-b1c008.netlify.app

### 4. Post-Deploy Verification
- [ ] Site loads without errors
- [ ] Chat screen accessible
- [ ] AI responds to test message
- [ ] Document creation works end-to-end
- [ ] No console errors in production

---

## 📊 Monitoring

After deployment, monitor:

### Supabase Edge Functions
- Dashboard: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/functions/generate-document/invocations
- Watch for:
  - Invocation count (should increase with usage)
  - Error rate (should be <5%)
  - Response time (target <5 seconds)

### Conversations Database
```sql
-- Check conversation activity
SELECT 
  COUNT(*) as total_conversations,
  COUNT(DISTINCT user_id) as unique_users,
  doc_type,
  DATE(created_at) as date
FROM conversations
GROUP BY doc_type, DATE(created_at)
ORDER BY date DESC;
```

### Common Issues

**Issue: AI not responding**
- Check GENAI_API_KEY is set in Supabase secrets
- Verify edge function deployed successfully
- Check browser console for 401/500 errors

**Issue: Prices seem wrong**
- Review template blocks in `services/plumbingData.ts`, etc.
- AI uses these as reference prices
- Update templates if market prices changed

**Issue: Conversation not saving**
- Verify conversations table exists (run migration)
- Check RLS policies allow user to INSERT
- Look for 403 errors in Network tab

---

## 🎯 Success Metrics

Track these KPIs:

1. **AI Accuracy**: >80% of generated invoices need no manual edits
2. **Response Time**: <5 seconds average
3. **Adoption**: >50% of invoices created via Chat (vs manual Canvas)
4. **Multi-turn**: >30% of conversations have 3+ messages
5. **Template Matching**: AI uses template prices in >70% of cases

---

## 📝 Next Phase

After successful testing and deployment, proceed to **Phase 3** in STRATEGIC_PLAN.md:

- Week 5: Contract data models (separate from invoices)
- Week 6: Contract-specific templates
- Week 7: Advanced contract clauses (scope, milestones, terms)
- Week 8: Contract generation from conversations
- Week 9: Testing & refinement

Focus: Making contracts truly different from invoices with proper legal clauses, payment milestones, project scopes, etc.
