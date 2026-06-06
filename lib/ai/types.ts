export const AI_INTENTS = [
  'set_availability',
  'block_time',
  'create_meeting_type',
  'edit_meeting_type',
  'create_paid_meeting',
  'set_buffer',
  'update_working_hours',
] as const;

export type AiIntent = (typeof AI_INTENTS)[number];

export type ParseStatus = 'success' | 'missing_info' | 'unsupported';

export interface ParsedAiCommand {
  status: ParseStatus;
  intent: AiIntent | null;
  payload: Record<string, unknown>;
  clarification_needed: string;
  /** Short human-readable summary for confirmation UI */
  summary: string;
  requires_confirmation: boolean;
}

export interface ExecuteAiResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface AiCommandLogRow {
  id: string;
  user_id: string;
  raw_prompt: string;
  parsed_intent: string | null;
  parsed_payload: Record<string, unknown> | null;
  execution_status: string;
  response_message: string | null;
  created_at: string;
}

export interface AiActionHistoryRow {
  id: string;
  user_id: string;
  command_log_id: string | null;
  action_type: string;
  action_payload: Record<string, unknown> | null;
  execution_result: Record<string, unknown> | null;
  success: boolean;
  created_at: string;
}
