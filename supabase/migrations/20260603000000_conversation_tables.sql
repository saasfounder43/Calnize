-- Conversations, messages, and onboarding session tables for agentic onboarding

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text,
  status text DEFAULT 'active',
  type text DEFAULT 'onboarding',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  current_step text,
  booking_type_id uuid,
  is_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_step_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_session_id uuid NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  step text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at DESC);

-- Enable RLS and basic policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_step_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can manage onboarding sessions" ON onboarding_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage onboarding step data" ON onboarding_step_data FOR ALL USING (
  EXISTS (SELECT 1 FROM onboarding_sessions s WHERE s.id = onboarding_step_data.onboarding_session_id AND s.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM onboarding_sessions s WHERE s.id = onboarding_step_data.onboarding_session_id AND s.user_id = auth.uid())
);
