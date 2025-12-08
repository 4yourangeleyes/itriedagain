# Setting Up Gemini API Key

## ⚠️ ISSUE FOUND: API Key Referrer Restriction

The edge function is failing with this error:
```
"Requests from referer <empty> are blocked." - API_KEY_HTTP_REFERRER_BLOCKED
```

This means the current Gemini API key has **HTTP referrer restrictions** that block requests from Supabase edge functions.

## Steps to Fix:

### 1. Fix Your Existing API Key (Recommended)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your Gemini API key in the list
3. Click on the key name to edit it
4. Under "Application restrictions":
   - Change from "HTTP referrers" to **"None"**
   - OR add `*.supabase.co/*` to allowed referrers
5. Click "Save"

### 2. OR Create a New Unrestricted API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. **IMPORTANT**: When creating, ensure "Application restrictions" is set to **"None"**
4. Copy the key (starts with `AIza...`)

### 2. OR Create a New Unrestricted API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. **IMPORTANT**: When creating, ensure "Application restrictions" is set to **"None"**
4. Copy the key (starts with `AIza...`)

### 3. Update the Secret in Supabase

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/settings/functions
2. Scroll to "Secrets" section
3. Find `GENAI_API_KEY` and click "Edit" (or create new if it doesn't exist)
4. Value: Paste your UNRESTRICTED Gemini API key
5. Click "Save"

**Option B: Using Supabase CLI**
```bash
supabase secrets set GENAI_API_KEY=YOUR_UNRESTRICTED_API_KEY_HERE --project-ref fopyamyrykwtlwgefxuq
```

### 4. Verify Edge Function Works

After updating the secret with an unrestricted key, test with curl:

```bash
curl -X POST 'https://fopyamyrykwtlwgefxuq.supabase.co/functions/v1/generate-document' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "I replaced a geyser for John Smith",
    "docType": "INVOICE",
    "clientName": "John Smith",
    "businessName": "Test Plumbing",
    "industry": "Plumber"
  }'
```

Expected response:
```json
{
  "title": "Geyser Installation - John Smith",
  "items": [
    {
      "description": "Geyser Kwikot 150L installation",
      "quantity": 1,
      "unitType": "ea",
      "price": 3400
    }
  ]
}
```

### 5. Run Comprehensive Tests

Once the secret is updated with an unrestricted key, run the tests:
```bash
npx tsx test-ai-comprehensive.ts
```

## Why This Happens

Supabase Edge Functions run on Deno Deploy infrastructure and don't send HTTP referer headers. If your Gemini API key is restricted to specific domains/referrers, it will block these requests.

**Security Note**: For production, you can:
- Use IP restrictions instead of referrer restrictions
- OR allow `*.supabase.co/*` as a referrer
- OR keep "None" since the key is stored as a secret and never exposed to the client

The key is already secure because:
✅ Stored as Supabase secret (encrypted)
✅ Only accessible by edge functions (server-side)
✅ Never sent to the browser/client
✅ Protected by Supabase's authentication

## Alternative: Test Locally

You can also test the edge function locally with Supabase CLI:

```bash
# Create .env.local file
echo "GENAI_API_KEY=YOUR_UNRESTRICTED_API_KEY_HERE" > .env.local

# Start local functions
supabase functions serve generate-document --env-file .env.local
```

Then test with:
```bash
curl -X POST 'http://localhost:54321/functions/v1/generate-document' \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "Test invoice", "docType": "INVOICE", "clientName": "Test", "businessName": "Test Co", "industry": "Plumber"}'
```

