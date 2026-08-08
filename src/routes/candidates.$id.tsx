import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProfile, NOT_SPECIFIED } from "@/lib/interview-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/candidates/$id")({
  head: () => ({
    meta: [
      { title: "Candidate Profile — AB Talks" },
      {
        name: "description",
        content:
          "Candidate profile with domain, experience, technologies, completed curriculum topics and learning progress.",
      },
      { property: "og:title", content: "Candidate Profile — AB Talks" },
      {
        property: "og:description",
        content: "Review the candidate's curriculum progress before starting the AI interview.",
      },
    ],
  }),
  loader: ({ params }) => {
    if (!getProfile(params.id)) throw notFound();
    return null;
  },
  component: CandidateProfilePage,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium">{value || NOT_SPECIFIED}</p>
    </div>
  );
}

function CandidateProfilePage() {
  const { id } = Route.useParams();
  const p = getProfile(id)!;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Link
        to="/candidates"
        className="inline-flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All candidates
      </Link>

      <div className="glass-panel mt-6 p-6 sm:p-8">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Candidate profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{p.name}</h1>
        <p className="mt-1 text-sm text-primary">{p.domain}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Experience" value={p.experience} />
          <Field label="Education" value={p.education} />
          <Field label="Course" value={p.cohort} />
          <Field label="Status" value={p.status} />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Learning progress</span>
            <span className="font-medium text-foreground">{p.progressPercent}%</span>
          </div>
          <Progress value={p.progressPercent} className="mt-2 h-2" />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field
              label="Missions completed"
              value={p.missionsCompleted !== null ? `${p.missionsCompleted}` : NOT_SPECIFIED}
            />
            <Field
              label="First-try missions"
              value={p.missionsFirstTry !== null ? `${p.missionsFirstTry}` : NOT_SPECIFIED}
            />
            <Field
              label="Commit days"
              value={p.commitDays !== null ? `${p.commitDays}` : NOT_SPECIFIED}
            />
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Technologies &amp; skills
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.skills.length ? (
              p.skills.map((s) => (
                <Badge key={s} variant="secondary" className="text-[11px] font-normal">
                  {s}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{NOT_SPECIFIED}</span>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Completed topics &amp; relevant curriculum
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {p.completedTopics.length ? (
              p.completedTopics.map((t) => (
                <div key={t.day} className="rounded-xl border border-border bg-card/40 p-4">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Day {t.day} · {t.module}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Attempts: {t.attempts !== null ? t.attempts : NOT_SPECIFIED}
                  </p>
                  {t.tools.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-[10px] font-normal">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{NOT_SPECIFIED}</span>
            )}
          </div>
        </section>

        {p.weakTopics.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold tracking-wide uppercase">Struggled / skipped</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.weakTopics.map((t) => (
                <Badge key={t.day} variant="outline" className="text-[11px] font-normal">
                  {t.title}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Button asChild size="lg" className="px-8 text-sm font-semibold tracking-wide">
            <Link to="/interview/$id" params={{ id: p.id }}>
              ENTER THE TEST
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
