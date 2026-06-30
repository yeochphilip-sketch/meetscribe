// AI Sales Assistant - Core Type Definitions

export interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface DecisionMaker {
  name: string;
  role: string;
  influence_level: 'primary' | 'influencer' | 'blocker' | 'unknown';
}

export interface Deal {
  id: string;
  user_id: string;
  team_id?: string | null;
  title: string;
  company_name?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  deal_value?: number | null;
  currency: string;
  pipeline_stage: string;
  close_probability?: number | null;
  estimated_close_date?: string | null;
  status: 'active' | 'won' | 'lost' | 'paused' | 'archived';
  source: 'manual' | 'calendar' | 'upload' | 'recording' | 'import' | 'integration';
  source_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DealTranscript {
  id: string;
  deal_id: string;
  user_id: string;
  full_transcript?: string | null;
  segments: TranscriptSegment[];
  speakers: string[];
  duration_seconds?: number | null;
  language: string;
  transcription_model: string;
  processing_status: 'pending' | 'transcribing' | 'diarizing' | 'analyzing' | 'completed' | 'failed';
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealIntelligence {
  id: string;
  deal_id: string;
  user_id: string;
  deal_summary?: string | null;
  customer_pain_points: string[];
  budget_confirmed: boolean;
  budget_amount?: number | null;
  budget_currency: string;
  decision_makers: DecisionMaker[];
  buying_timeline?: string | null;
  objections: string[];
  competitors_mentioned: string[];
  buying_signals: string[];
  risk_factors: string[];
  next_steps: string[];
  estimated_close_probability?: number | null;
  meeting_type: 'discovery' | 'demo' | 'negotiation' | 'closing' | 'follow_up' | 'cold_call' | 'renewal';
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  follow_up_email?: string | null;
  follow_up_email_subject?: string | null;
  crm_update_payload?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DealAction {
  id: string;
  deal_id: string;
  user_id: string;
  action_type: 'follow_up_email' | 'crm_sync' | 'task_creation' | 'calendar_suggestion' | 'document_share' | 'slack_notification';
  status: 'pending' | 'approved' | 'executed' | 'failed' | 'dismissed';
  title: string;
  description?: string | null;
  payload?: Record<string, unknown>;
  executed_at?: string | null;
  execution_result?: Record<string, unknown>;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealCoaching {
  id: string;
  deal_id: string;
  user_id: string;
  rep_talk_ratio?: number | null;
  customer_talk_ratio?: number | null;
  total_talk_time_seconds?: number | null;
  longest_monologue_seconds?: number | null;
  interruption_count: number;
  filler_word_count: number;
  filler_words: Record<string, number>;
  question_count: number;
  discovery_question_count: number;
  objections_raised: number;
  objections_handled: number;
  objection_handling_score?: number | null;
  discovery_depth_score?: number | null;
  topics_covered: string[];
  overall_score?: number | null;
  coaching_recommendations: string[];
  benchmark_percentile?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  team_id?: string | null;
  provider: 'google_calendar' | 'google_gmail' | 'google_drive' | 'google_meet' | 'salesforce' | 'hubspot' | 'zoom' | 'teams';
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  scope: string[];
  config?: Record<string, unknown>;
  is_active: boolean;
  last_sync_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysisRequest {
  deal_id: string;
  title: string;
  transcript: string;
  segments: TranscriptSegment[];
  company_name?: string;
  contact_name?: string;
  deal_value?: number;
  pipeline_stage?: string;
}

export interface AIAnalysisResponse {
  intelligence: Omit<DealIntelligence, 'id' | 'deal_id' | 'user_id' | 'created_at' | 'updated_at'>;
  actions: Omit<DealAction, 'id' | 'deal_id' | 'user_id' | 'created_at' | 'updated_at'>[];
  coaching: Omit<DealCoaching, 'id' | 'deal_id' | 'user_id' | 'created_at' | 'updated_at'>;
}

export interface DashboardStats {
  total_deals: number;
  deals_this_week: number;
  deals_won: number;
  deals_lost: number;
  total_pipeline_value: number;
  avg_close_probability: number;
  pending_actions: number;
  meetings_this_month: number;
}
