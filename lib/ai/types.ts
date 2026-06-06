export type ParsedAiCommand = {
  intent: string;
  status?: 'success' | 'error' | string;
  requires_confirmation?: boolean;
  summary?: string;
  clarification_needed?: string;
  parameters?: Record<string, unknown>;
};
