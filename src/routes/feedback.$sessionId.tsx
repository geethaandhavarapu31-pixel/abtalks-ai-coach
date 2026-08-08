import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AccuracyRing } from "@/components/accuracy-ring";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Target,
  ListChecks,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Users,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/feedback/$sessionId")({
  head: () => ({
    meta: [
      { title: "AI Interview Feedback — AB Talks" },
      {
        name: "description",
        content:
          "Overall score, accuracy, topic performance, attempt comparison and a personalized improvement plan.",
      },
      { property: "og:title", content: "AI Interview Feedback — AB Talks" },
      { property: "og:description", content: "Your AB Talks AI interview results and next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedbackPage,
});

type TopicRow = {
  topic: string;
  questions: number;
  averageScore: number;
  accuracy: number;
  status: string;
};

type Report = {
  candidate?: { name?: string; domain?: string };
  candidateId?: string | null;
  attemptId?: string;
  attemptNumber?: number;
  status?: string;
  finalStatus?: string | null;
  turns?: { index: number; topic: string; question: string; answer: string; evaluation: any }[];
  feedback?: any;
  previousAttempt?: {
    attemptId: string;
    attemptNumber: number;
    overallScore: number;
    accuracy: number;
    topicPerformance: TopicRow[];
  } | null;
  comparison?: {
    first: { attemptId: string; attemptNumber: number; overallScore: number; accuracy: number };
    retake: { attemptId: string; attemptNumber: number; overallScore: number; accuracy: number };
    scoreImprovement: number;
    accuracyImprovement: number;
    topicComparison: {
      topic: string;
      firstAccuracy: number;
      retakeAccuracy: number;
      change: number;
    }[];
    mostImproved: { topic: string; change: number } | null;
    weakest: TopicRow | null;
    status: string;
  } | null;
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel mt-6 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Delta({ value, suffix }: { value: number; suffix: string }) {
  const up = value > 0;
  const flat = value === 0;
  return (
    <span
      className={
        flat ? "text-muted-foreground" : up ? "font-semibold text-success" : "font-semibold text-destructive"
      }
    >
      {up ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function FeedbackPage() {
  const { sessionId } = Route.useParams();
  const { data, isLoading, error } = useQuery<Report>({
    queryKey: ["interview-report", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/interview?sessionId=${encodeURIComponent(sessionId)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Could not load feedback");
      return json;
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Building your AI feedback…
        </p>
      </main>
    );
  }

  if (error || !data?.feedback) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          {(error as Error)?.message ?? "Feedback is not available for this session yet."}
        </p>
        <Button asChild className="mt-6">
          <Link to="/candidates">Back to candidates</Link>
        </Button>
      </main>
    );
  }

  const f = data.feedback;
  const turns = data.turns ?? [];
  const cmp = data.comparison ?? null;
  const candidateId = data.candidateId ?? null;
  const topics: TopicRow[] = Array.isArray(f.topicPerformance) ? f.topicPerformance : [];
  const weakest = cmp?.weakest ?? (topics.length ? [...topics].sort((a, b) => a.accuracy - b.accuracy)[0] : null);
  const status = cmp?.status ?? data.finalStatus ?? null;

  const RetakeButtons = (
    <div className="flex flex-wrap justify-center gap-3">
      {candidateId ? (
        <Button asChild size="lg" className="px-7 text-sm font-semibold tracking-wide">
          <Link to="/interview/$id" params={{ id: candidateId }}>
            <RefreshCw className="mr-2 h-4 w-4" /> RETAKE INTERVIEW
          </Link>
        </Button>
      ) : null}
      <Button asChild size="lg" variant="outline" className="px-7 text-sm font-semibold tracking-wide">
        <Link to="/candidates">
          <Users className="mr-2 h-4 w-4" /> BACK TO CANDIDATES
        </Link>
      </Button>
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.2em] text-success uppercase">
        <CheckCircle2 className="h-4 w-4" /> Interview completed successfully
      </p>
      <h1 className="mt-4 text-center text-3xl font-semibold sm:text-4xl">
        AI Interview <span className="gradient-text">Feedback</span>
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {data.candidate?.name ?? "Candidate"} · {data.candidate?.domain ?? "Not specified"} · Attempt{" "}
        {data.attemptNumber ?? 1} ({data.attemptId ?? "Not specified"})
      </p>
      {status && (
        <p className="mt-4 text-center">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
            {status}
          </span>
        </p>
      )}

      <div className="glass-panel mt-8 grid gap-6 p-6 sm:grid-cols-2">
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Overall score</p>
          <p className="mt-2 text-5xl font-semibold gradient-text">{f.overallScore} / 10</p>
        </div>
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Overall accuracy
          </p>
          <p className="mt-2 text-5xl font-semibold gradient-text">{f.accuracy}%</p>
        </div>
        <p className="sm:col-span-2 text-center text-sm leading-relaxed text-muted-foreground">
          {f.summary}
        </p>
      </div>

      {/* ---------------- Interview progress (retake comparison) ---------------- */}
      {cmp && (
        <Section title="Interview progress" icon={TrendingUp}>
          <div className="grid gap-8 sm:grid-cols-3 sm:items-center">
            <AccuracyRing
              value={cmp.first.accuracy}
              label={`First attempt`}
              caption={`Score ${cmp.first.overallScore} / 10`}
              tone="accent"
            />
            <div className="order-last text-center sm:order-none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Improvement
              </p>
              <p className="mt-3 text-3xl">
                <Delta value={cmp.scoreImprovement} suffix=" pts" />
              </p>
              <p className="mt-1 text-2xl">
                <Delta value={cmp.accuracyImprovement} suffix="%" />
              </p>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                {cmp.accuracyImprovement >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                First vs retake
              </p>
            </div>
            <AccuracyRing
              value={cmp.retake.accuracy}
              label={`Retake · attempt ${cmp.retake.attemptNumber}`}
              caption={`Score ${cmp.retake.overallScore} / 10`}
            />
          </div>

          {cmp.topicComparison.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Topic improvement
              </h3>
              <div className="mt-4 space-y-4">
                {cmp.topicComparison.map((t) => (
                  <div key={t.topic} className="rounded-xl border border-border bg-card/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{t.topic}</span>
                      <span className="text-xs text-muted-foreground">
                        First {t.firstAccuracy}% → Retake {t.retakeAccuracy}% ·{" "}
                        <Delta value={t.change} suffix="%" />
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <Progress value={t.firstAccuracy} className="h-1.5 opacity-50" />
                      <Progress value={t.retakeAccuracy} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {cmp.mostImproved && (
              <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Most improved topic
                </p>
                <p className="mt-1.5 text-sm font-medium">{cmp.mostImproved.topic}</p>
                <p className="mt-1 text-sm text-success">+{cmp.mostImproved.change}%</p>
              </div>
            )}
            {weakest && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Topic to focus on
                </p>
                <p className="mt-1.5 text-sm font-medium">{weakest.topic}</p>
                <p className="mt-1 text-sm text-muted-foreground">Accuracy: {weakest.accuracy}%</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {!cmp && (
        <Section title="Accuracy" icon={Target}>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <AccuracyRing
              value={f.accuracy}
              label={`Attempt ${data.attemptNumber ?? 1}`}
              caption={`Score ${f.overallScore} / 10`}
            />
            {weakest && (
              <div className="max-w-xs rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Topic to focus on
                </p>
                <p className="mt-1.5 text-sm font-medium">{weakest.topic}</p>
                <p className="mt-1 text-sm text-muted-foreground">Accuracy: {weakest.accuracy}%</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {topics.length > 0 && (
        <Section title="Topic performance" icon={Target}>
          <div className="space-y-4">
            {topics.map((t) => (
              <div key={t.topic}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{t.topic}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.questions} question(s) · avg {t.averageScore}/10 · {t.accuracy}% ·{" "}
                    <span className="text-foreground">{t.status}</span>
                  </span>
                </div>
                <Progress value={t.accuracy} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Your strengths" icon={CheckCircle2}>
        {f.strengths?.length ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {f.strengths.map((s: string, i: number) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Not specified</p>
        )}
      </Section>

      {Array.isArray(f.mistakes) && f.mistakes.length > 0 && (
        <Section title="Where you made mistakes" icon={AlertTriangle}>
          <div className="space-y-4">
            {f.mistakes.map((m: any, i: number) => (
              <div key={i} className="rounded-xl border border-border bg-card/40 p-4 text-sm">
                <p className="font-medium">{m.question}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="text-foreground">Your answer:</span> {m.answer || "Not specified"}
                </p>
                <Badge variant="outline" className="mt-3 text-[11px] font-normal">
                  Score {m.score}/10
                </Badge>
                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="text-foreground">What was wrong:</span> {m.whatWasWrong}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="text-foreground">Correct concept:</span> {m.correctConcept}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="text-foreground">How to improve:</span> {m.howToImprove}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------------- Subjects to improve ---------------- */}
      <Section title="Subjects to improve" icon={BookOpen}>
        {topics.filter((t) => t.accuracy < 80).length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {topics
              .filter((t) => t.accuracy < 80)
              .sort((a, b) => a.accuracy - b.accuracy)
              .map((t) => {
                const related = turns.filter((x) => x.topic === t.topic);
                const missing = Array.from(
                  new Set(related.flatMap((x) => x.evaluation?.missingConcepts ?? [])),
                ).slice(0, 4);
                return (
                  <div key={t.topic} className="rounded-xl border border-border bg-card/40 p-4">
                    <p className="text-sm font-medium">{t.topic}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Current accuracy: {t.accuracy}% · {t.status}
                    </p>
                    <Progress value={t.accuracy} className="mt-2 h-1.5" />
                    <p className="mt-3 text-xs text-muted-foreground">
                      <span className="text-foreground">Why improve:</span> scored{" "}
                      {t.averageScore}/10 across {t.questions} question(s) in this attempt.
                    </p>
                    {missing.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-foreground">What to study:</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {missing.map((m, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] font-normal">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No topic scored below 80% in this attempt — keep reinforcing what you already know.
          </p>
        )}
      </Section>

      <Section title="Your next learning focus" icon={ListChecks}>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {(f.plan?.length ? f.plan : (f.next ?? [])).map((s: string, i: number) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
        {f.topicsToImprove?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {f.topicsToImprove.map((t: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-[11px] font-normal">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </Section>

      {turns.length > 0 && (
        <Section title="Full transcript" icon={ListChecks}>
          <div className="space-y-3">
            {turns.map((t) => (
              <div key={t.index} className="rounded-xl border border-border bg-card/40 p-4 text-sm">
                <p className="text-xs text-muted-foreground">
                  Q{t.index} · {t.topic} · Score {t.evaluation?.score}/10
                </p>
                <p className="mt-1.5 font-medium">{t.question}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{t.answer || "Not specified"}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------------- Motivational closing ---------------- */}
      <section className="glass-panel mt-10 overflow-hidden p-8 text-center sm:p-12">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h2 className="mt-5 text-xl font-semibold sm:text-2xl">
          Thank You for Completing Your Interview
        </h2>
        <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="mt-5 text-base font-medium tracking-wide gradient-text sm:text-lg">
          Keep Learning. Keep Growing. Keep Improving.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Good luck on your next interview!</p>
        <p className="mt-1 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Thank you for choosing AB Talks.
        </p>
      </section>

      <div className="mt-8">{RetakeButtons}</div>
    </main>
  );
}
