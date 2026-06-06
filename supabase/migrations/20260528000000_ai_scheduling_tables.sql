-- AI Scheduling Assistant: command logs and action history

CREATE TABLE IF NOT EXISTS ai_command_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_prompt text NOT NULL,
  parsed_intent text,
  parsed_payload jsonb,
  execution_status text NOT NULL DEFAULT 'parsed',
  response_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_action_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  command_log_id uuid REFERENCES ai_command_logs(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  action_payload jsonb,
  execution_result jsonb,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_command_logs_user_created
  ON ai_command_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_action_history_user_created
  ON ai_action_history (user_id, created_at DESC);

ALTER TABLE ai_command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_action_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai command logs"
  ON ai_command_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai command logs"
  ON ai_command_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai command logs"
  ON ai_command_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ai action history"
  ON ai_action_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai action history"
  ON ai_action_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ai command logs"
  ON ai_command_logs FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage all ai action history"
  ON ai_action_history FOR ALL
  USING (public.is_admin());
