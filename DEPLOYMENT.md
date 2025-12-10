# Lock-In Production Deployment Guide

## Overview

Lock-In is a full-stack team management and time-tracking application built with:
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Hosting**: Vercel, Netlify, or any static host

## Pre-Deployment Checklist

### 1. Environment Configuration
✅ Supabase project is set up and configured
✅ Environment variables are configured (.env files)
✅ Database migrations are applied
✅ Authentication is enabled

### 2. Security Review

#### Row Level Security (RLS)
All tables have RLS policies enabled to ensure:
- Users can only see data from their organization
- Only founders can manage team members
- Proper access control per role

#### Authentication
- Email/password authentication via Supabase Auth
- Session management handled by Supabase
- Passwords auto-generated for team members
- Password hashing handled by Supabase (bcrypt)

#### API Security
- All API calls go through Supabase with proper authentication
- Publishable key (anon) has limited permissions
- No sensitive data exposed in frontend code

### 3. Database Backup
Before deployment, ensure you have:
```bash
# Backup current Supabase data
pg_dump "postgresql://..." > backup.sql
```

## Deployment Instructions

### Option 1: Vercel (Recommended)

1. **Connect Repository**
```bash
npm install -g vercel
vercel link
```

2. **Configure Environment**
In Vercel Dashboard > Settings > Environment Variables:
```
VITE_SUPABASE_URL=https://hdhqvfcbmbrxwbbtuoev.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Deploy**
```bash
npm run build
vercel deploy --prod
```

### Option 2: Netlify

1. **Connect Repository**
- Go to Netlify > New site from Git
- Select your repository
- Choose GitHub as provider

2. **Configure Build Settings**
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variables in Netlify UI

3. **Configure Redirects**
Create `public/_redirects`:
```
/* /index.html 200
```

4. **Deploy**
Push to main branch - Netlify auto-deploys

### Option 3: Docker (Self-hosted)

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

2. **Build and Deploy**
```bash
docker build -t lock-in:latest .
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=... \
  -e VITE_SUPABASE_ANON_KEY=... \
  lock-in:latest
```

## Post-Deployment Verification

### 1. Health Checks
```bash
# Check if app loads
curl https://your-domain.com

# Check if auth works
# Try creating organization on /onboarding

# Check if database connects
# Try signing in with test account
```

### 2. Monitoring
- Set up error tracking (Sentry recommended)
- Monitor Supabase dashboard for issues
- Enable CORS properly

### 3. SSL/TLS
- Vercel/Netlify handle this automatically
- Self-hosted: Use Let's Encrypt

## Production Features

### 1. Auto-Generated Passwords
When adding team members, system generates secure passwords:
- 12 characters minimum
- Contains uppercase, lowercase, numbers, symbols
- Randomly shuffled for security

### 2. Multi-Organization Support
- Each organization has isolated data
- Founders create organizations
- No cross-org data access

### 3. Real-Time Updates
- Uses Supabase Realtime subscriptions
- Chat messages update in real-time
- Clock entries sync across users

## Troubleshooting

### Sign-in Not Working
1. Verify Supabase credentials in .env
2. Check database users table has data
3. Confirm authentication is enabled in Supabase

### Database Connection Issues
1. Check Supabase project status
2. Verify connection string
3. Check RLS policies aren't blocking queries

### Build Failures
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check TypeScript errors: `npm run build`
3. Verify all imports are correct

## Scaling Considerations

### Database
- Monitor connections limit
- Set up read replicas if needed
- Archive old data periodically

### Frontend Performance
- Code splitting already implemented
- Consider CDN for assets
- Enable gzip compression

### Rate Limiting
- Implement rate limiting on Supabase edge functions
- Set up DDoS protection (Cloudflare recommended)

## Monitoring & Analytics

### Recommended Tools
1. **Error Tracking**: Sentry
2. **Uptime Monitoring**: Pingdom
3. **Analytics**: Mixpanel or Segment
4. **Logging**: LogRocket

### Key Metrics to Track
- Sign-up success rate
- Active users per organization
- Database query performance
- API response times

## Maintenance

### Regular Tasks
- Monitor database size
- Review and update dependencies monthly
- Audit security settings quarterly
- Backup data weekly

### Update Procedures
```bash
# Update dependencies
npm update

# Test locally
npm run dev

# Run tests if available
npm test

# Build and deploy
npm run build
vercel deploy --prod
```

## Support & Documentation

- Supabase Docs: https://supabase.com/docs
- React Documentation: https://react.dev
- Vite Guide: https://vitejs.dev/guide/

---

**Deployment Status**: ✅ Ready for Production
**Last Updated**: December 10, 2024
**Version**: 1.0.0
