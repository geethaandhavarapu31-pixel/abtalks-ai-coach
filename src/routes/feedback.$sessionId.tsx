import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, Target, ListChecks } from "lucide-react";

export const Route = createFileRoute("/feedback/$sessionId")({
  head: () => ({
    meta: [
      { title: "AI Interview Feedback — AB Talks" },
      {
        name: "description",
        content:
          "Overall score, accuracy, topic performance, mistakes and a personalized improvement plan.",
      },
      { property: "og:title", content: "AI Interview Feedback — AB Talks" },
      { property: "og:description", content: "Your AB Talks AI interview results and next steps." },
    ],
  }),
  component: FeedbackPage,
});

type Report = {
  candidate?: { name?: string; domain?: string };
  attemptId?: string;
  status?: string;
  turns?: { index: number; topic: string; question: string; answer: string; evaluation: any }[];
  feedback?: any;
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
    <section className="glass-panel mt-6 p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.2em] text-success uppercase">
        <CheckCircle2 className="h-4 w-4" /> Interview completed successfully
      </p>
      <h1 className="mt-4 text-center text-3xl font-semibold sm:text-4xl">
        AI Interview <span className="gradient-text">Feedback</span>
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {data.candidate?.name ?? "Candidate"} · {data.candidate?.domain ?? "Not specified"} · Attempt{" "}
        {data.attemptId ?? "Not specified"}
      </p>

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

      {Array.isArray(f.topicPerformance) && f.topicPerformance.length > 0 && (
        <Section title="Topic performance" icon={Target}>
          <div className="space-y-4">
            {f.topicPerformance.map((t: any) => (
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

      <Section title="Topics to improve" icon={Target}>
        {f.topicsToImprove?.length || f.gaps?.length ? (
          <div className="flex flex-wrap gap-2">
            {(f.topicsToImprove?.length ? f.topicsToImprove : f.gaps).map((t: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-[11px] font-normal">
                {t}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not specified</p>
        )}
      </Section>

      <Section title="How you can improve" icon={ListChecks}>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {(f.plan?.length ? f.plan : f.next ?? []).map((s: string, i: number) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
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

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/candidates">Interview another candidate</Link>
        </Button>
        <Button asChild>
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
