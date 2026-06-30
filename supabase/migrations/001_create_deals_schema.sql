-- ============================================================
-- AI Sales Assistant - Core Database Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  title TEXT NOT NULL,
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  deal_value DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  pipeline_stage TEXT DEFAULT 'discovery',
  close_probability INTEGER CHECK (close_probability >= 0 AND close_probability <= 100),
  estimated_close_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'paused', 'archived')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'calendar', 'upload', 'recording', 'import', 'integration')),
  source_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_transcript TEXT,
  segments JSONB DEFAULT '[]',
  speakers JSONB DEFAULT '[]',
  duration_seconds INTEGER,
  language TEXT DEFAULT 'en',
  transcription_model TEXT DEFAULT 'whisper-large-v3',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'transcribing', 'diarizing', 'analyzing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_summary TEXT,
  customer_pain_points TEXT[],
  budget_confirmed BOOLEAN DEFAULT false,
  budget_amount DECIMAL(12,2),
  budget_currency TEXT DEFAULT 'USD',
  decision_makers JSONB DEFAULT '[]',
  buying_timeline TEXT,
  objections TEXT[],
  competitors_mentioned TEXT[],
  buying_signals TEXT[],
  risk_factors TEXT[],
  next_steps TEXT[],
  estimated_close_probability INTEGER CHECK (estimated_close_probability >= 0 AND estimated_close_probability <= 100),
  meeting_type TEXT DEFAULT 'discovery' CHECK (meeting_type IN ('discovery', 'demo', 'negotiation', 'closing', 'follow_up', 'cold_call', 'renewal')),
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
  follow_up_email TEXT,
  follow_up_email_subject TEXT,
  crm_update_payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('follow_up_email', 'crm_sync', 'task_creation', 'calendar_suggestion', 'document_share', 'slack_notification')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'failed', 'dismissed')),
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ,
  execution_result JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deal_coaching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rep_talk_ratio DECIMAL(5,2),
  customer_talk_ratio DECIMAL(5,2),
  total_talk_time_seconds INTEGER,
  longest_monologue_seconds INTEGER,
  interruption_count INTEGER DEFAULT 0,
  filler_word_count INTEGER DEFAULT 0,
  filler_words JSONB DEFAULT '{}',
  question_count INTEGER DEFAULT 0,
  discovery_question_count INTEGER DEFAULT 0,
  objections_raised INTEGER DEFAULT 0,
  objections_handled INTEGER DEFAULT 0,
  objection_handling_score INTEGER CHECK (objection_handling_score >= 0 AND objection_handling_score <= 100),
  discovery_depth_score INTEGER CHECK (discovery_depth_score >= 0 AND discovery_depth_score <= 100),
  topics_covered JSONB DEFAULT '[]',
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  coaching_recommendations TEXT[],
  benchmark_percentile INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  provider TEXT NOT NULL CHECK (provider IN ('google_calendar', 'google_gmail', 'google_drive', 'google_meet', 'salesforce', 'hubspot', 'zoom', 'teams')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scope TEXT[],
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  probability INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (team_id IS NOT NULL OR user_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('salesforce', 'hubspot')),
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'sync')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'account', 'opportunity', 'task', 'note', 'email')),
  external_id TEXT,
  payload JSONB DEFAULT '{}',
  response JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'browser_recording', 'calendar_import', 'cloud_import', 'integration', 'manual')),
  source_provider TEXT,
  external_id TEXT,
  metadata JSONB DEFAULT '{}',
  file_path TEXT,
  file_size_bytes INTEGER,
  duration_seconds INTEGER,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Update existing profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sales_role TEXT DEFAULT 'rep' CHECK (sales_role IN ('rep', 'manager', 'director', 'founder', 'other'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_team_id ON deals(team_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_stage ON deals(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_deal_transcripts_deal_id ON deal_transcripts(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_intelligence_deal_id ON deal_intelligence(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_actions_deal_id ON deal_actions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_actions_status ON deal_actions(status);
CREATE INDEX IF NOT EXISTS idx_deal_coaching_deal_id ON deal_coaching(deal_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_deal_id ON crm_sync_logs(deal_id);

-- RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_coaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deals" ON deals FOR SELECT USING (user_id = auth.uid() OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create their own deals" ON deals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own deals" ON deals FOR UPDATE USING (user_id = auth.uid() OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
CREATE POLICY "Users can delete their own deals" ON deals FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own transcripts" ON deal_transcripts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own transcripts" ON deal_transcripts FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own intelligence" ON deal_intelligence FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own intelligence" ON deal_intelligence FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own actions" ON deal_actions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own actions" ON deal_actions FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own coaching" ON deal_coaching FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own coaching" ON deal_coaching FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own integrations" ON integrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own integrations" ON integrations FOR ALL USING (user_id = auth.uid());

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_transcripts_updated_at BEFORE UPDATE ON deal_transcripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_intelligence_updated_at BEFORE UPDATE ON deal_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_actions_updated_at BEFORE UPDATE ON deal_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_coaching_updated_at BEFORE UPDATE ON deal_coaching FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
