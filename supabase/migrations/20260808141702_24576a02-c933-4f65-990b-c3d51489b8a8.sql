ALTER TABLE public.interview_attempts
  ADD COLUMN IF NOT EXISTS candidate_id text,
  ADD COLUMN IF NOT EXISTS attempt_number integer NOT NULL DEFAULT 1;

UPDATE public.interview_attempts
  SET candidate_id = candidate->>'id'
  WHERE candidate_id IS NULL;

CREATE INDEX IF NOT EXISTS interview_attempts_candidate_idx
  ON public.interview_attempts (candidate_id, created_at);