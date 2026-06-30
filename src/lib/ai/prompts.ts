// AI Sales Assistant - Groq AI Prompts

export const SALES_INTELLIGENCE_SYSTEM_PROMPT = `You are an expert sales intelligence analyst with 20+ years of enterprise sales experience. Analyze sales call transcripts and extract structured, actionable intelligence. Extract only what is explicitly stated or strongly implied. Return ONLY valid JSON - no markdown, no code blocks, no explanations.`;

export const SALES_INTELLIGENCE_USER_PROMPT = (params: {
  title: string;
  transcript: string;
  segments: Array<{ speaker: string; text: string; start: number; end: number }>;
  company_name?: string;
  contact_name?: string;
  deal_value?: number;
  pipeline_stage?: string;
}) => {
  const segmentSummary = params.segments
    .map((s, i) => `[${i + 1}] ${s.speaker} (${s.start}s-${s.end}s): ${s.text}`)
    .join("\n");

  return `Analyze this sales call and return structured intelligence.

MEETING TITLE: ${params.title}
COMPANY: ${params.company_name || "Unknown"}
CONTACT: ${params.contact_name || "Unknown"}
DEAL VALUE: ${params.deal_value ? "$" + params.deal_value : "Unknown"}
CURRENT STAGE: ${params.pipeline_stage || "discovery"}

TRANSCRIPT WITH SPEAKER LABELS:
${segmentSummary}

FULL TRANSCRIPT:
${params.transcript}

Return JSON with: deal_summary, customer_pain_points[], budget_confirmed, budget_amount, budget_currency, decision_makers[{name,role,influence_level}], buying_timeline, objections[], competitors_mentioned[], buying_signals[], risk_factors[], next_steps[], estimated_close_probability (0-100, realistic), meeting_type (discovery|demo|negotiation|closing|follow_up|cold_call|renewal), sentiment (very_positive|positive|neutral|negative|very_negative), follow_up_email (3-4 paragraphs), follow_up_email_subject, crm_update_payload{next_activity,stage_change,notes}`;
};

export const COACHING_ANALYSIS_SYSTEM_PROMPT = `You are an elite sales coach. Analyze the sales call transcript for objective, data-driven coaching insights. Be direct and constructive. Focus on behaviors, not personality.`;

export const COACHING_ANALYSIS_USER_PROMPT = (params: {
  transcript: string;
  segments: Array<{ speaker: string; text: string; start: number; end: number }>;
}) => {
  const speakerTimes: Record<string, number> = {};
  params.segments.forEach((s) => {
    speakerTimes[s.speaker] = (speakerTimes[s.speaker] || 0) + (s.end - s.start);
  });
  const totalTime = Object.values(speakerTimes).reduce((a, b) => a + b, 0);
  const speakerBreakdown = Object.entries(speakerTimes)
    .map(([name, time]) => `${name}: ${Math.round(time)}s (${Math.round((time / totalTime) * 100)}%)`)
    .join(", ");

  return `Analyze this sales call for coaching insights.

SPEAKER TALK TIME:
${speakerBreakdown}

TRANSCRIPT:
${params.transcript}

Return JSON with: rep_talk_ratio (0-100), customer_talk_ratio (0-100), total_talk_time_seconds, longest_monologue_seconds, interruption_count, filler_word_count, filler_words{um,uh,like,you know,so,actually,basically,literally}, question_count, discovery_question_count, objections_raised, objections_handled, objection_handling_score (0-100), discovery_depth_score (0-100), topics_covered[], overall_score (0-100), coaching_recommendations[], benchmark_percentile (0-100)`;
};
