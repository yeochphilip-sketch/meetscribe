#!/bin/bash
cd ~/meetscribe || exit 1
echo "=== Script 1: Creating directory structure ==="

mkdir -p "src/app/api/v1/deals/[id]/intelligence"
mkdir -p "src/app/api/v1/deals/[id]/actions"
mkdir -p "src/app/api/v1/deals/[id]/coaching"
mkdir -p "src/app/api/v1/integrations/google/calendar"
mkdir -p "src/app/api/v1/integrations/google/gmail"
mkdir -p "src/app/api/v1/integrations/google/drive"
mkdir -p "src/app/api/v1/integrations/salesforce"
mkdir -p "src/app/api/v1/integrations/hubspot"
mkdir -p "src/app/api/v1/actions/execute"
mkdir -p "src/app/api/v1/actions/dashboard"
mkdir -p "src/app/api/v1/analytics/team"
mkdir -p "src/app/api/v1/analytics/individual"
mkdir -p "src/app/api/v1/analytics/pipeline"
mkdir -p "src/app/api/v1/webhooks/google/calendar"
mkdir -p "src/app/api/v1/cron/detect-meetings"
mkdir -p "src/app/api/v1/cron/process-transcription"
mkdir -p "src/app/api/v1/cron/generate-actions"
mkdir -p "src/app/api/v1/cron/sync-crm"
mkdir -p "src/app/api/v1/cron/send-follow-ups"
mkdir -p "src/app/api/v1/cron/coaching-analysis"

mkdir -p "src/app/deals/[id]"
mkdir -p "src/app/deals/new"
mkdir -p "src/app/actions"
mkdir -p "src/app/analytics"
mkdir -p "src/app/integrations"

mkdir -p "src/lib/ai"
mkdir -p "src/lib/integrations"
mkdir -p "src/lib/crm"
mkdir -p "src/lib/coaching"
mkdir -p "src/lib/actions"
mkdir -p "src/lib/types"

mkdir -p "src/components/deals"
mkdir -p "src/components/analytics"
mkdir -p "src/components/actions"
mkdir -p "src/components/integrations"
mkdir -p "src/components/coaching"

mkdir -p "src/hooks"
mkdir -p "supabase/migrations"

echo "=== Directory structure created ==="
find src/app src/lib src/components src/hooks supabase -type d | sort
