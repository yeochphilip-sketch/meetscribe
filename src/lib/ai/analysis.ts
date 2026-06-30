import Groq from "groq-sdk";
import {
  SALES_INTELLIGENCE_SYSTEM_PROMPT,
  SALES_INTELLIGENCE_USER_PROMPT,
  COACHING_ANALYSIS_SYSTEM_PROMPT,
  COACHING_ANALYSIS_USER_PROMPT,
} from "./prompts";
import type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  DealIntelligence,
  DealCoaching,
  DealAction,
} from "@/lib/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ANALYSIS_MODEL = "llama-3.3-70b-versatile";
const FAST_MODEL = "llama-3.1-8b-instant";

export async function analyzeSalesCall(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  const [intelligenceResult, coachingResult] = await Promise.all([
    extractSalesIntelligence(request),
    extractCoachingInsights(request),
  ]);
  const actions = generateActionsFromIntelligence(
    intelligenceResult,
    request.deal_id
  );
  return { intelligence: intelligenceResult, actions, coaching: coachingResult };
}

async function extractSalesIntelligence(
  request: AIAnalysisRequest
): Promise<Omit<DealIntelligence, "id" | "deal_id" | "user_id" | "created_at" | "updated_at">> {
  const completion = await groq.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: SALES_INTELLIGENCE_SYSTEM_PROMPT },
      {
        role: "user",
        content: SALES_INTELLIGENCE_USER_PROMPT({
          title: request.title,
          transcript: request.transcript,
          segments: request.segments,
          company_name: request.company_name,
          contact_name: request.contact_name,
          deal_value: request.deal_value,
          pipeline_stage: request.pipeline_stage,
        }),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 4096,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content from Groq intelligence analysis");
  const parsed = JSON.parse(content);
  return {
    deal_summary: parsed.deal_summary || "",
    customer_pain_points: parsed.customer_pain_points || [],
    budget_confirmed: parsed.budget_confirmed ?? false,
    budget_amount: parsed.budget_amount ?? null,
    budget_currency: parsed.budget_currency || "USD",
    decision_makers: parsed.decision_makers || [],
    buying_timeline: parsed.buying_timeline || null,
    objections: parsed.objections || [],
    competitors_mentioned: parsed.competitors_mentioned || [],
    buying_signals: parsed.buying_signals || [],
    risk_factors: parsed.risk_factors || [],
    next_steps: parsed.next_steps || [],
    estimated_close_probability: parsed.estimated_close_probability ?? 50,
    meeting_type: parsed.meeting_type || "discovery",
    sentiment: parsed.sentiment || "neutral",
    follow_up_email: parsed.follow_up_email || "",
    follow_up_email_subject: parsed.follow_up_email_subject || "Follow-up from our call",
    crm_update_payload: parsed.crm_update_payload || {},
  };
}

async function extractCoachingInsights(
  request: AIAnalysisRequest
): Promise<Omit<DealCoaching, "id" | "deal_id" | "user_id" | "created_at" | "updated_at">> {
  const completion = await groq.chat.completions.create({
    model: FAST_MODEL,
    messages: [
      { role: "system", content: COACHING_ANALYSIS_SYSTEM_PROMPT },
      {
        role: "user",
        content: COACHING_ANALYSIS_USER_PROMPT({
          transcript: request.transcript,
          segments: request.segments,
        }),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 2048,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content from Groq coaching analysis");
  const parsed = JSON.parse(content);
  return {
    rep_talk_ratio: parsed.rep_talk_ratio ?? null,
    customer_talk_ratio: parsed.customer_talk_ratio ?? null,
    total_talk_time_seconds: parsed.total_talk_time_seconds ?? null,
    longest_monologue_seconds: parsed.longest_monologue_seconds ?? null,
    interruption_count: parsed.interruption_count ?? 0,
    filler_word_count: parsed.filler_word_count ?? 0,
    filler_words: parsed.filler_words || {},
    question_count: parsed.question_count ?? 0,
    discovery_question_count: parsed.discovery_question_count ?? 0,
    objections_raised: parsed.objections_raised ?? 0,
    objections_handled: parsed.objections_handled ?? 0,
    objection_handling_score: parsed.objection_handling_score ?? null,
    discovery_depth_score: parsed.discovery_depth_score ?? null,
    topics_covered: parsed.topics_covered || [],
    overall_score: parsed.overall_score ?? null,
    coaching_recommendations: parsed.coaching_recommendations || [],
    benchmark_percentile: parsed.benchmark_percentile ?? null,
  };
}

function generateActionsFromIntelligence(
  intelligence: Omit<DealIntelligence, "id" | "deal_id" | "user_id" | "created_at" | "updated_at">,
  dealId: string
): Omit<DealAction, "id" | "deal_id" | "user_id" | "created_at" | "updated_at">[] {
  const actions: Omit<DealAction, "id" | "deal_id" | "user_id" | "created_at" | "updated_at">[] = [];

  if (intelligence.follow_up_email && intelligence.follow_up_email.trim().length > 50) {
    actions.push({
      action_type: "follow_up_email",
      status: "pending",
      title: "Send follow-up email",
      description: intelligence.follow_up_email_subject || "Follow-up from sales call",
      payload: {
        subject: intelligence.follow_up_email_subject,
        body: intelligence.follow_up_email,
      },
    });
  }

  if (intelligence.crm_update_payload && Object.keys(intelligence.crm_update_payload).length > 0) {
    actions.push({
      action_type: "crm_sync",
      status: "pending",
      title: "Sync deal updates to CRM",
      description: "Update deal with new intelligence",
      payload: intelligence.crm_update_payload,
    });
  }

  (intelligence.next_steps || []).forEach((step, index) => {
    actions.push({
      action_type: "task_creation",
      status: "pending",
      title: `Next step: ${step.slice(0, 60)}${step.length > 60 ? "..." : ""}`,
      description: step,
      payload: {
        priority: index === 0 ? "high" : "medium",
        due_date: intelligence.buying_timeline || null,
      },
    });
  });

  if (
    intelligence.buying_timeline &&
    (intelligence.buying_timeline.toLowerCase().includes("asap") ||
      intelligence.buying_timeline.toLowerCase().includes("week") ||
      intelligence.buying_timeline.toLowerCase().includes("urgent"))
  ) {
    actions.push({
      action_type: "calendar_suggestion",
      status: "pending",
      title: "Schedule follow-up meeting",
      description: `Prospect indicated timeline: ${intelligence.buying_timeline}. Suggest scheduling next call within 48 hours.`,
      payload: { suggested_duration: 30, urgency: "high" },
    });
  }

  return actions;
}

export async function generatePreMeetingBrief(params: {
  contactName?: string;
  companyName?: string;
  dealHistory?: string;
  previousMeetings?: Array<{ date: string; summary: string }>;
  dealValue?: number;
  stage?: string;
}): Promise<{
  talking_points: string[];
  questions_to_ask: string[];
  objections_to_prepare_for: string[];
  key_stakeholders: string[];
  recommended_approach: string;
  risk_factors: string[];
}> {
  const completion = await groq.chat.completions.create({
    model: FAST_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a strategic sales prep analyst. Generate concise, actionable pre-meeting briefs.",
      },
      {
        role: "user",
        content: `Generate a pre-meeting brief.

CONTACT: ${params.contactName || "Unknown"}
COMPANY: ${params.companyName || "Unknown"}
STAGE: ${params.stage || "discovery"}
DEAL VALUE: ${params.dealValue ? "$" + params.dealValue : "Unknown"}

PREVIOUS MEETINGS:
${(params.previousMeetings || []).map((m) => `- ${m.date}: ${m.summary}`).join("\n")}

DEAL HISTORY:
${params.dealHistory || "No prior history"}

Return JSON: {"talking_points": [], "questions_to_ask": [], "objections_to_prepare_for": [], "key_stakeholders": [], "recommended_approach": "", "risk_factors": []}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1500,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content from pre-meeting brief generation");
  return JSON.parse(content);
}
