import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Brain } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AB Talks — AI Technical Interview Platform" },
      {
        name: "description",
        content:
          "AB Talks runs a personalized AI technical interview based on your skills, learning progress, courses and curriculum.",
      },
      { property: "og:title", content: "AB Talks — AI Technical Interview Platform" },
      {
        property: "og:description",
        content: "Personalized AI technical interviews driven by your real curriculum progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="grid-backdrop pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="glass-panel glow-ring relative z-10 w-full max-w-3xl px-6 py-14 text-center sm:px-12">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Technical Interview Agent
        </p>
        <h1 className="text-4xl font-semibold sm:text-6xl">
          Welcome to <span className="gradient-text">AB Talks</span>
        </h1>
        <p className="mt-4 text-base font-medium text-primary sm:text-lg">
          AI-Powered Technical Interview Platform
        </p>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          “Experience a personalized AI technical interview based on your skills, learning
          progress, courses, and curriculum.”
        </p>

        <div className="mt-10">
          <Button asChild size="lg" className="px-10 text-sm font-semibold tracking-wide">
            <Link to="/candidates">START INTERVIEW</Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Brain, label: "Adaptive questioning", copy: "Basic → Easy → Moderate only" },
            { icon: ShieldCheck, label: "Semantic scoring", copy: "Meaning, not keywords" },
            { icon: Sparkles, label: "Actionable feedback", copy: "Topic-level improvement plan" },
          ].map(({ icon: Icon, label, copy }) => (
            <div key={label} className="rounded-xl border border-border bg-card/40 p-4 text-left">
              <Icon className="h-4 w-4 text-accent" />
              <p className="mt-3 text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
