import { createFileRoute, Link } from "@tanstack/react-router";
import { profiles, cohortLabel } from "@/lib/interview-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/candidates/")({
  head: () => ({
    meta: [
      { title: "Select a Candidate — AB Talks" },
      {
        name: "description",
        content: "Choose a cohort member to start their personalized AI technical interview.",
      },
      { property: "og:title", content: "Select a Candidate — AB Talks" },
      {
        property: "og:description",
        content: "Cohort members and their learning progress, loaded from the cohort dataset.",
      },
    ],
  }),
  component: CandidateSelection,
});

function CandidateSelection() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <header className="mt-6">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Step 1 · Select candidate
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Cohort <span className="gradient-text">candidates</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{cohortLabel}</p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <Link
            key={p.id}
            to="/candidates/$id"
            params={{ id: p.id }}
            className="glass-panel group flex flex-col p-5 transition-transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="text-xs text-muted-foreground">{p.domain}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Learning progress</span>
                <span className="font-medium text-foreground">{p.progressPercent}%</span>
              </div>
              <Progress value={p.progressPercent} className="mt-2 h-1.5" />
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Completed topics: {p.completedTopics.length}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.completedTopics.slice(0, 3).map((t) => (
                <Badge key={t.day} variant="secondary" className="text-[10px] font-normal">
                  {t.title}
                </Badge>
              ))}
              {p.completedTopics.length > 3 && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{p.completedTopics.length - 3}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
