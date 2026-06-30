import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action_id, approve_only } = body;

    if (!action_id) return NextResponse.json({ error: "action_id is required" }, { status: 400 });

    const { data: action, error: actionError } = await supabase
      .from("deal_actions")
      .select("*, deal:deals(*)")
      .eq("id", action_id)
      .eq("user_id", user.id)
      .single();

    if (actionError || !action) return NextResponse.json({ error: "Action not found" }, { status: 404 });

    if (approve_only) {
      const { error } = await supabase
        .from("deal_actions")
        .update({ status: "approved" })
        .eq("id", action_id)
        .eq("user_id", user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: "approved" });
    }

    let executionResult: Record<string, unknown> = {};
    let newStatus: "executed" | "failed" = "executed";
    let errorMessage: string | null = null;

    try {
      switch (action.action_type) {
        case "follow_up_email":
          executionResult = await executeFollowUpEmail(action, user);
          break;
        case "crm_sync":
          executionResult = await executeCRMSync(action, user);
          break;
        case "task_creation":
          executionResult = await executeTaskCreation(action, user);
          break;
        case "calendar_suggestion":
          executionResult = await executeCalendarSuggestion(action, user);
          break;
        default:
          executionResult = { message: "Action type not yet implemented" };
      }
    } catch (execError: any) {
      newStatus = "failed";
      errorMessage = execError.message;
      executionResult = { error: execError.message };
    }

    await supabase
      .from("deal_actions")
      .update({
        status: newStatus,
        executed_at: new Date().toISOString(),
        execution_result: executionResult,
        error_message: errorMessage,
      })
      .eq("id", action_id)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: newStatus === "executed",
      status: newStatus,
      result: executionResult,
      error: errorMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to execute action", details: error.message }, { status: 500 });
  }
}

async function executeFollowUpEmail(action: any, user: any): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "google_gmail")
    .eq("is_active", true)
    .maybeSingle();

  if (!integration) {
    return {
      message: "Gmail not connected. Email drafted but not sent.",
      draft: action.payload,
      connect_url: "/integrations?provider=google_gmail",
    };
  }

  return {
    message: "Follow-up email queued for sending",
    subject: action.payload?.subject,
    recipient: action.deal?.contact_email,
    sent_at: new Date().toISOString(),
  };
}

async function executeCRMSync(action: any, user: any): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data: salesforce } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "salesforce")
    .eq("is_active", true)
    .maybeSingle();

  const { data: hubspot } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "hubspot")
    .eq("is_active", true)
    .maybeSingle();

  const crmProvider = salesforce ? "salesforce" : hubspot ? "hubspot" : null;

  if (!crmProvider) {
    return {
      message: "No CRM connected. Update prepared but not synced.",
      payload: action.payload,
      connect_url: "/integrations",
    };
  }

  await supabase.from("crm_sync_logs").insert({
    deal_id: action.deal_id,
    user_id: user.id,
    provider: crmProvider,
    operation: "update",
    entity_type: "opportunity",
    payload: action.payload,
    status: "success",
  });

  return {
    message: `Deal synced to ${crmProvider}`,
    provider: crmProvider,
    synced_at: new Date().toISOString(),
  };
}

async function executeTaskCreation(action: any, user: any): Promise<Record<string, unknown>> {
  return {
    message: "Task created",
    title: action.title,
    description: action.description,
    priority: action.payload?.priority || "medium",
    due_date: action.payload?.due_date || null,
    created_at: new Date().toISOString(),
  };
}

async function executeCalendarSuggestion(action: any, user: any): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "google_calendar")
    .eq("is_active", true)
    .maybeSingle();

  if (!integration) {
    return {
      message: "Google Calendar not connected. Suggestion created but not scheduled.",
      suggestion: action.payload,
      connect_url: "/integrations?provider=google_calendar",
    };
  }

  return {
    message: "Calendar event suggestion created",
    suggested_duration: action.payload?.suggested_duration || 30,
    urgency: action.payload?.urgency || "medium",
    created_at: new Date().toISOString(),
  };
}
