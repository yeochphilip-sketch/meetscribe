#!/bin/bash
# ============================================================
# Script 99: Commit and Push to GitHub
# Run: bash scripts/99_commit_and_push.sh
# ============================================================

cd ~/meetscribe || exit 1

echo "=== Adding all new files ==="
git add src/app/api/v1/
git add src/lib/ai/
git add src/lib/types/
git add src/lib/integrations/
git add src/lib/crm/
git add src/lib/coaching/
git add src/lib/actions/
git add src/components/deals/
git add src/components/analytics/
git add src/components/actions/
git add src/components/integrations/
git add src/components/coaching/
git add src/hooks/
git add supabase/migrations/
git add src/app/deals/
git add src/app/actions/
git add src/app/analytics/
git add src/app/integrations/
git add scripts/

echo "=== Git status ==="
git status

echo "=== Committing ==="
git commit -m "feat: transform MeetScribe into AI Sales Assistant

Architecture changes:
- New database schema: deals, deal_transcripts, deal_intelligence, deal_actions, deal_coaching, integrations, teams, pipeline_stages, crm_sync_logs
- AI analysis engine with Groq: sales intelligence extraction + coaching analytics
- Enhanced transcription API with Whisper Large-v3 and speaker segments
- Deal processing pipeline: transcribe -> analyze -> generate actions
- Unified action dashboard: follow-up emails, CRM sync, tasks, calendar suggestions
- Sales coaching analytics: talk ratio, discovery score, objection handling, overall score
- Integration APIs: Google Calendar OAuth, Salesforce, HubSpot
- Pipeline analytics with weighted value and conversion funnel
- Team analytics with rep leaderboards

Value proposition: The AI sales assistant that turns every sales call into
actionable next steps, follow-up emails, and automatic CRM updates."

echo "=== Pushing to GitHub ==="
git push origin main

echo "=== Done ==="
