import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProfile, type CandidateProfile } from "@/lib/interview-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";

const TOTAL = 8;

type Question = { index: number; question: string; topic: string; difficulty: string };

export const Route = createFileRoute("/interview/$id")({
  head: () => ({
    meta: [
      { title: "AI Technical Interview — AB Talks" },
      {
        name: "description",
        content: "Live AI technical interview session with adaptive questions and semantic scoring.",
      },
      { property: "og:title", content: "AI Technical Interview — AB Talks" },
      { property: "og:description", content: "Answer adaptive AI-generated technical questions." },
    ],
  }),
  loader: ({ params }) => {
    if (!getProfile(params.id)) throw notFound();
    return null;
  },
  component: InterviewPage,
});

function InterviewPage() {
  const { id } = Route.useParams();
  const candidate = getProfile(id)! as CandidateProfile;
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetake, setIsRetake] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const started = useRef(false);

  const post = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "The AI service is unavailable. Please retry.");
    return data;
  }, []);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    const sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}`;
    const attemptId = `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      const data = await post({
        sessionId: sid,
        attemptId,
        candidateId: candidate.id,
        candidate: { ...candidate, raw: undefined },
      });
      setSessionId(sid);
      setQuestion(data.question);
      setIsRetake(Boolean(data.isRetake));
      setAttemptNumber(data.attemptNumber ?? 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [candidate, post]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  async function submit() {
    if (!sessionId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await post({ sessionId, message: answer });
      setAnswer("");
      if (data.done) {
        navigate({ to: "/feedback/$sessionId", params: { sessionId } });
        return;
      }
      setQuestion(data.question);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function endInterview() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await post({ sessionId, end: true });
      navigate({ to: "/feedback/$sessionId", params: { sessionId } });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const number = question?.index ?? 1;
  const progress = Math.round(((number - 1) / TOTAL) * 100);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          AB <span className="gradient-text">TALKS</span>
        </h1>
        <p className="mt-1 text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          AI Technical Interview
        </p>
      </header>

      <div className="glass-panel mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <span className="text-muted-foreground">Candidate: </span>
            <span className="font-medium">{candidate.name}</span>
            {isRetake && (
              <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                Retake · Attempt {attemptNumber}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Question {number} / {TOTAL}
          </p>
        </div>
        <Progress value={progress} className="mt-3 h-2" />

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-[11px] font-normal">
            Current topic: {question?.topic ?? "…"}
          </Badge>
          <Badge variant="outline" className="text-[11px] font-normal">
            Difficulty: {question?.difficulty ?? "Basic"}
          </Badge>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card/50 p-5">
          {question ? (
            <p className="text-base leading-relaxed">{question.question}</p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Preparing your first question…
            </p>
          )}
        </div>

        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={busy || !question}
          placeholder="Type your answer here..."
          className="mt-5 min-h-40 resize-y bg-card/40"
        />

        {busy && question && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI is evaluating your answer...
          </p>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{error}</p>
              <p className="mt-1 text-muted-foreground">
                Your answer was saved. You can submit again to retry — the interview will not reset.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={busy || !question} className="px-8 font-semibold">
            {busy ? "PLEASE WAIT…" : "SUBMIT ANSWER"}
          </Button>
          <Button variant="outline" onClick={endInterview} disabled={busy || !sessionId}>
            END INTERVIEW
          </Button>
          {!sessionId && !busy && (
            <Button variant="secondary" onClick={start}>
              Retry start
            </Button>
          )}
          <Link
            to="/candidates/$id"
            params={{ id }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back to profile
          </Link>
        </div>
      </div>
    </main>
  );
}
