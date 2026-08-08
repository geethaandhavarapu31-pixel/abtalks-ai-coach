CREATE TABLE public.interview_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  attempt_id TEXT NOT NULL,
  candidate JSONB NOT NULL,
  turns JSONB NOT NULL DEFAULT '[]'::jsonb,
  pending JSONB,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback JSONB,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT ALL ON public.interview_attempts TO service_role;
ALTER TABLE public.interview_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages interview attempts" ON public.interview_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);