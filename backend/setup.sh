#!/bin/bash

# Supabase Database Setup Script
# This script helps set up the lock-in database schema

set -e

echo "🚀 Lock-In Database Setup"
echo "=========================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo ""
echo "📝 Next Steps:"
echo "1. Go to https://supabase.com and sign in to your project"
echo "2. Navigate to SQL Editor"
echo "3. Create a new query"
echo "4. Copy and paste the contents of: backend/supabase/schema.sql"
echo "5. Click 'Run' to execute the schema"
echo ""

echo "💡 Or use this command if you have the Supabase CLI configured:"
echo "   supabase db push"
echo ""

echo "🔑 Environment Variables:"
echo "   Add to your .env file:"
echo "   REACT_APP_SUPABASE_URL=https://hdhqvfcbmbrxwbbtuoev.supabase.co"
echo "   REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>"
echo ""
echo "   Get your anon key from:"
echo "   Project Settings → API → anon (public) key"
echo ""

echo "✅ Setup instructions ready!"
