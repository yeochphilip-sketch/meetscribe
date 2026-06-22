#!/bin/bash

PROD_URL="https://meetscribe-v2.vercel.app"

echo "Production URL: $PROD_URL"
echo ""
echo "Update these MANUALLY in your dashboards:"
echo ""
echo "Supabase Dashboard → Authentication → URL Configuration:"
echo "  Site URL:       $PROD_URL"
echo "  Redirect URL:   $PROD_URL/auth/callback"
echo ""
echo "Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID:"
echo "  Authorized redirect URI: $PROD_URL/auth/callback"
echo ""
echo "Also add for local dev:"
echo "  http://localhost:3000/auth/callback"
