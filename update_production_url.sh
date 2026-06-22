#!/bin/bash

# Your production Vercel URL
PROD_URL="https://meetscribe.vercel.app"

echo "Updating production URL references to: $PROD_URL"

# Update auth/callback/route.ts - replace the generic origin logic
sed -i '' "s|https://\${forwardedHost}|${PROD_URL}|g" src/app/auth/callback/route.ts 2>/dev/null || sed -i "s|https://\${forwardedHost}|${PROD_URL}|g" src/app/auth/callback/route.ts

# Update any hardcoded domain references in Supabase config files if they exist
# (These are typically env vars, but just in case)

echo "Done. Production URL set to: $PROD_URL"
echo ""
echo "Next: Update these in your Supabase Dashboard:"
echo "  Site URL: ${PROD_URL}"
echo "  Redirect URL: ${PROD_URL}/auth/callback"
echo ""
echo "And in Google Cloud Console OAuth credentials:"
echo "  Authorized redirect URI: ${PROD_URL}/auth/callback"
