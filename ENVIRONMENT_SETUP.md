# Environment Setup Guide

## 🔐 Security Best Practices

This project uses environment variables to store sensitive credentials. **Never commit these to version control.**

## Setup Steps

### 1. Create Your Local Environment File

```bash
cp .env.local.example .env.local
```

### 2. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Get Your Gemini API Key (Optional - for AI features)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy it to `GEMINI_API_KEY`

### 4. Update .env.local

Open `.env.local` and replace the placeholder values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
GEMINI_API_KEY=AIzaSy...your-actual-key
```

## 🚨 Security Checklist

- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] Never commit `.env.local` to version control
- [ ] Never share your keys in screenshots, issues, or documentation
- [ ] Use different keys for development and production
- [ ] Rotate keys immediately if accidentally exposed
- [ ] Enable Row Level Security (RLS) in Supabase for all tables

## Environment Files Explained

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.local.example` | Template with placeholder values | ✅ Yes |
| `.env.local` | Your actual credentials | ❌ No (gitignored) |
| `.env` | Shared non-sensitive defaults | ✅ Yes (if used) |
| `.env.production` | Production-specific values | ❌ No (gitignored) |

## Troubleshooting

### App shows blank screen
- Check browser console for errors
- Verify `.env.local` exists and has correct values
- Restart the dev server after changing `.env.local`

### Authentication not working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify network connection to Supabase

### AI features not working
- Verify `GEMINI_API_KEY` is set
- Check API key is valid in Google AI Studio
- Verify API quotas haven't been exceeded
