import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/interview  — see technical-spec.md
 *   start: { sessionId, candidate }
 *   turn:  { sessionId, message }
 * GET  /api/interview?sessionId=...  — full stored report (used by the feedback page)
 */
const MODEL = "google/gemini-3.6-flash";
export const PRIMARY_QUESTIONS = 8;

type Difficulty = "Basic" | "Easy" | "Moderate";

type Evaluation = {
  score: number;
  status: "correct" | "mostly_correct" | "partially_correct" | "incorrect";
  reason: string;
  strengths: string[];
  missingConcepts: string[];
  incorrectConcepts: string[];
  correctConcept: string;
  howToImprove: string;
  followUpNeeded: boolean;
  followUpReason: string;
};

type Turn = {
  index: number;
  question: string;
  topic: string;
  difficulty: Difficulty;
  answer: string;
  evaluation: Evaluation;
};

type Pending = {
  index: number;
  question: string;
  topic: string;
  difficulty: Difficulty;
  answer?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
type AiFailure = {
  code: "ALLOWANCE_EXHAUSTED" | "RATE_LIMITED" | "AI_UNAVAILABLE" | "AI_NOT_CONFIGURED";
  status: number;
  message: string;
};

// Maps a raw AI/gateway error into a stable code + friendly, user-facing message.
function aiFailure(raw: string): AiFailure {
  if (/credits|allowance|quota|payment required|402/i.test(raw)) {
    return {
      code: "ALLOWANCE_EXHAUSTED",
      status: 402,
      message:
        "The AI allowance for this workspace is used up, so the interviewer can't generate the next step right now. Your interview is saved — add credits in Settings → Plans & credits, then continue exactly where you left off.",
    };
  }
  if (/rate limit|too many requests|429/i.test(raw)) {
    return {
      code: "RATE_LIMITED",
      status: 429,
      message:
        "The AI interviewer is handling too many requests right now. Your progress is saved — wait a few seconds and continue.",
    };
  }
  if (/not configured/i.test(raw)) {
    return {
      code: "AI_NOT_CONFIGURED",
      status: 503,
      message:
        "The AI interviewer isn't configured for this project yet. Your interview is saved and will resume once it's connected.",
    };
  }
  return {
    code: "AI_UNAVAILABLE",
    status: 502,
    message:
      "The AI interviewer is temporarily unavailable. Your answers are saved — press continue to resume the interview.",
  };
}

function aiStatus(message: string) {
  return aiFailure(message).status;
}

// Error response that always carries the state needed to resume the same session.
function aiErrorResponse(
  error: unknown,
  state: {
    sessionId: string;
    answered: number;
    question?: Pending | null;
    evaluation?: Evaluation;
  },
) {
  const raw = error instanceof Error ? error.message : String(error);
  const failure = aiFailure(raw);
  return json(
    {
      error: failure.message,
      code: failure.code,
      retryable: true,
      resumable: true,
      detail: raw,
      sessionId: state.sessionId,
      answeredQuestions: state.answered,
      totalQuestions: PRIMARY_QUESTIONS,
      ...(state.question ? { question: state.question, questionNumber: state.question.index } : {}),
      ...(state.evaluation ? { evaluation: state.evaluation } : {}),
    },
    failure.status,
  );
}

async function callGemini(system: string, user: string): Promise<any> {
  const key = process.env['LOVABLE_API_KEY'];

  if (!key) {
    throw new Error("AI is not configured");
  }

  const url = "https://ai.gateway.lovable.dev/v1/chat/completions";

  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
        }),
      });

      const responseText = await res.text();

      if (res.status === 429) {
        throw new Error("AI rate limit reached. Please try again in a moment.");
      }

      if (res.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }

      if (!res.ok) {
        lastError = `AI request failed [${res.status}]: ${responseText}`;
        console.error(lastError);
        continue;
      }

      let payload: any;

      try {
        payload = JSON.parse(responseText);
      } catch {
        lastError = `AI returned invalid JSON: ${responseText}`;
        console.error(lastError);
        continue;
      }

      const text = payload?.choices?.[0]?.message?.content ?? "";

      if (!text) {
        lastError = "AI returned an empty response";
        console.error("AI payload:", payload);
        continue;
      }


      const cleaned = text
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "")
        .trim();

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      try {
        return JSON.parse(
          start >= 0 && end >= 0
            ? cleaned.slice(start, end + 1)
            : cleaned
        );
      } catch (parseError) {
        lastError = `Gemini returned invalid JSON content: ${cleaned}`;
        console.error("JSON parse error:", parseError);
        console.error("Gemini text:", cleaned);
        continue;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      console.error("AI error:", message);

      // Terminal errors: surface as-is, no retry, no wrapping
      if (/credits|rate limit/i.test(message)) {
        throw error instanceof Error ? error : new Error(message);
      }

      lastError = `AI connection failed: ${message}`;

      // Retry once
      if (attempt === 0) {
        continue;
      }
    }

  }

  throw new Error(lastError || "Gemini request failed");
}
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
function list(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];
}
function clampDifficulty(v: unknown): Difficulty {
  const s = str(v).toLowerCase();
  if (s === "moderate") return "Moderate";
  if (s === "easy") return "Easy";
  return "Basic";
}

function candidateBrief(candidate: any): string {
  return JSON.stringify(
    {
      name: candidate?.name,
      domain: candidate?.domain,
      experience: candidate?.experience,
      education: candidate?.education,
      cohort: candidate?.cohort,
      skills: candidate?.skills,
      completedTopics: (candidate?.completedTopics ?? []).map((t: any) => ({
        topic: t.title,
        module: t.module,
        tools: t.tools,
        objectives: t.objectives,
        attempts: t.attempts,
      })),
      weakTopics: (candidate?.weakTopics ?? []).map((t: any) => t.title),
    },
    null,
    1,
  );
}

function targetDifficulty(lastScore: number | null): Difficulty {
  if (lastScore === null) return "Basic";
  if (lastScore <= 3) return "Easy";
  if (lastScore <= 6) return "Easy";
  if (lastScore <= 8) return "Moderate";
  return "Moderate";
}

export type PriorAttempt = {
  attemptId: string;
  attemptNumber: number;
  overallScore: number;
  accuracy: number;
  topicPerformance: { topic: string; accuracy: number; questions: number; averageScore: number }[];
  questions: { question: string; topic: string; score: number }[];
  missingConcepts: string[];
};

function priorBrief(prior: PriorAttempt | null): string {
  if (!prior) return "";
  return [
    `PREVIOUS ATTEMPT (${prior.attemptId}) — overall ${prior.overallScore}/10, accuracy ${prior.accuracy}%.`,
    `PREVIOUS TOPIC ACCURACY:\n${prior.topicPerformance
      .map((t) => `- ${t.topic}: ${t.accuracy}%`)
      .join("\n")}`,
    `PREVIOUSLY ASKED QUESTIONS (NEVER repeat these, ask NEW different questions):\n${prior.questions
      .map((q) => `- [${q.topic}] ${q.question} (scored ${q.score}/10)`)
      .join("\n")}`,
    `MISSING CONCEPTS FROM LAST TIME (focus here):\n${prior.missingConcepts.join(", ") || "none"}`,
    "This is a RETAKE. Prioritise the weakest previous topics, ask DIFFERENT questions that probe the same weak areas from another angle, and stay strictly inside the candidate's domain, curriculum and completed topics. Difficulty must remain Basic/Easy/Moderate.",
  ].join("\n\n");
}

async function generateQuestion(
  candidate: any,
  turns: Turn[],
  prior: PriorAttempt | null = null,
): Promise<Pending> {
  const last = turns.length ? turns[turns.length - 1]! : undefined;
  const lastScore = last ? last.evaluation.score : null;
  const difficulty = turns.length === 0 ? "Basic" : targetDifficulty(lastScore);

  const system =
    "You are AB Talks, an AI technical interviewer. You ask ONE question at a time. " +
    "Questions must come ONLY from the candidate's own domain, completed curriculum topics, tools and objectives supplied to you. " +
    "Never invent topics outside the supplied data. Allowed difficulty values are exactly: Basic, Easy, Moderate. " +
    "Never ask advanced/expert questions. Never repeat a previously asked question from this attempt or a previous attempt. " +
    'Reply with JSON only: {"question": string, "topic": string, "difficulty": "Basic"|"Easy"|"Moderate"}';

  const user = [
    `CANDIDATE DATA:\n${candidateBrief(candidate)}`,
    priorBrief(prior),
    `ALREADY ASKED (do not repeat):\n${
      turns.map((t) => `- [${t.topic}] ${t.question} (score ${t.evaluation.score}/10)`).join("\n") ||
      "- none"
    }`,
    last
      ? `LAST ANSWER EVALUATION: score ${last.evaluation.score}/10, status ${last.evaluation.status}, missing concepts: ${
          last.evaluation.missingConcepts.join(", ") || "none"
        }. ${
          last.evaluation.followUpNeeded
            ? "A short follow-up on the same topic (e.g. a simple example) is appropriate; it counts as the next question."
            : "Move to a different completed topic if one is available."
        }`
      : "This is question 1: ask a simple fundamental question from a completed topic.",
    `Target difficulty: ${difficulty}. Question number ${turns.length + 1} of at least ${PRIMARY_QUESTIONS}. Try to cover at least 4 different topics across the interview.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const out = await callGemini(system, user);
  return {
    index: turns.length + 1,
    question: str(out.question, "Explain one concept you learned in your completed curriculum."),
    topic: str(out.topic, "Not specified"),
    difficulty: clampDifficulty(out.difficulty ?? difficulty),
  };
}


async function evaluateAnswer(
  candidate: any,
  pending: Pending,
  answer: string,
): Promise<Evaluation> {
  const system =
    "You are a fair semantic technical evaluator. Judge the TECHNICAL MEANING of the answer, never exact wording. " +
    "Different wording, simple English, grammar mistakes or short-but-valid explanations must NOT be penalised. " +
    "If roughly 80% or more of the important concepts are demonstrated, treat the answer as correct/mostly correct and score high. " +
    "Scoring: 9-10 correct and complete, 7-8 mostly correct, 5-6 partial understanding, 3-4 major gaps, 0-2 incorrect or irrelevant. " +
    'Reply with JSON only: {"score":0,"status":"correct|mostly_correct|partially_correct|incorrect","reason":"","strengths":[],"missingConcepts":[],"incorrectConcepts":[],"correctConcept":"","howToImprove":"","followUpNeeded":false,"followUpReason":""}';

  const user = [
    `Candidate domain: ${candidate?.domain ?? "Not specified"}`,
    `Topic: ${pending.topic}`,
    `Difficulty: ${pending.difficulty}`,
    `QUESTION: ${pending.question}`,
    `CANDIDATE ANSWER: ${answer || "(no answer given)"}`,
    "correctConcept = a concise statement of the correct technical concept. howToImprove = one concrete actionable tip.",
  ].join("\n");

  const out = await callGemini(system, user);
  const rawScore = Number(out.score);
  const statusValue = str(out.status, "partially_correct");
  const allowed = ["correct", "mostly_correct", "partially_correct", "incorrect"];
  return {
    score: Number.isFinite(rawScore) ? Math.max(0, Math.min(10, Math.round(rawScore))) : 0,
    status: (allowed.includes(statusValue) ? statusValue : "partially_correct") as Evaluation["status"],
    reason: str(out.reason, "Not specified"),
    strengths: list(out.strengths),
    missingConcepts: list(out.missingConcepts),
    incorrectConcepts: list(out.incorrectConcepts),
    correctConcept: str(out.correctConcept, "Not specified"),
    howToImprove: str(out.howToImprove, "Not specified"),
    followUpNeeded: out.followUpNeeded === true,
    followUpReason: str(out.followUpReason, ""),
  };
}

export function topicPerformance(turns: Turn[]) {
  const map = new Map<string, { topic: string; questions: number; total: number }>();
  for (const t of turns) {
    const entry = map.get(t.topic) ?? { topic: t.topic, questions: 0, total: 0 };
    entry.questions += 1;
    entry.total += t.evaluation.score;
    map.set(t.topic, entry);
  }
  return Array.from(map.values())
    .map((e) => {
      const average = e.total / e.questions;
      const accuracy = Math.round(average * 10);
      return {
        topic: e.topic,
        questions: e.questions,
        averageScore: Math.round(average * 10) / 10,
        accuracy,
        status: accuracy >= 80 ? "Good" : accuracy >= 60 ? "Fair" : "Needs Improvement",
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);
}

async function buildFeedback(candidate: any, turns: Turn[]) {
  const topics = topicPerformance(turns);
  const average = turns.reduce((s, t) => s + t.evaluation.score, 0) / (turns.length || 1);
  const overallScore = Math.round(average * 10) / 10;
  const accuracy = Math.round(average * 10);

  const system =
    "You are AB Talks' AI interview coach. Base every statement strictly on the supplied interview transcript, scores and the candidate's curriculum data. " +
    "Never praise without evidence and never invent topics that were not tested or present in the candidate data. " +
    'Reply with JSON only: {"summary":"","strengths":[],"gaps":[],"next":[],"topicsToImprove":[],"plan":[]}. ' +
    "strengths/gaps/next/topicsToImprove/plan are arrays of concise, actionable strings.";

  const user = [
    `CANDIDATE DATA:\n${candidateBrief(candidate)}`,
    `TRANSCRIPT:\n${turns
      .map(
        (t) =>
          `Q${t.index} [${t.topic} · ${t.difficulty}]: ${t.question}\nAnswer: ${t.answer}\nScore: ${t.evaluation.score}/10 (${t.evaluation.status}) — ${t.evaluation.reason}\nMissing: ${
            t.evaluation.missingConcepts.join(", ") || "none"
          }`,
      )
      .join("\n\n")}`,
    `TOPIC PERFORMANCE:\n${topics
      .map((t) => `${t.topic}: ${t.accuracy}% over ${t.questions} question(s)`)
      .join("\n")}`,
    `Overall score ${overallScore}/10, accuracy ${accuracy}%.`,
  ].join("\n\n");

  let ai: any = {};
  try {
    ai = await callGemini(system, user);
  } catch {
    ai = {};
  }

  const mistakes = turns
    .filter((t) => t.evaluation.score < 7)
    .map((t) => ({
      question: t.question,
      answer: t.answer,
      score: t.evaluation.score,
      whatWasWrong: t.evaluation.reason,
      correctConcept: t.evaluation.correctConcept,
      howToImprove: t.evaluation.howToImprove,
    }));

  return {
    summary: str(ai.summary, `Completed ${turns.length} questions with an overall accuracy of ${accuracy}%.`),
    strengths: list(ai.strengths).length
      ? list(ai.strengths)
      : Array.from(new Set(turns.flatMap((t) => t.evaluation.strengths))).slice(0, 6),
    gaps: list(ai.gaps).length
      ? list(ai.gaps)
      : Array.from(new Set(turns.flatMap((t) => t.evaluation.missingConcepts))).slice(0, 6),
    next: list(ai.next).length ? list(ai.next) : topics.slice(0, 3).map((t) => `Revise ${t.topic}`),
    topicsToImprove: list(ai.topicsToImprove).length
      ? list(ai.topicsToImprove)
      : topics.filter((t) => t.accuracy < 80).map((t) => t.topic),
    plan: list(ai.plan).length ? list(ai.plan) : list(ai.next),
    overallScore,
    accuracy,
    topicPerformance: topics,
    mistakes,
  };
}

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function rowToPrior(row: any): PriorAttempt | null {
  if (!row || !row.feedback) return null;
  const turns = (row.turns ?? []) as Turn[];
  return {
    attemptId: row.attempt_id,
    attemptNumber: row.attempt_number ?? 1,
    overallScore: row.feedback.overallScore ?? 0,
    accuracy: row.feedback.accuracy ?? 0,
    topicPerformance: row.feedback.topicPerformance ?? [],
    questions: turns.map((t) => ({
      question: t.question,
      topic: t.topic,
      score: t.evaluation?.score ?? 0,
    })),
    missingConcepts: Array.from(
      new Set(turns.flatMap((t) => t.evaluation?.missingConcepts ?? [])),
    ).slice(0, 12),
  };
}

async function fetchPrior(
  supabase: any,
  candidateId: string | null,
  attemptNumber: number,
): Promise<{ prior: PriorAttempt | null; row: any }> {
  if (!candidateId || attemptNumber <= 1) return { prior: null, row: null };
  const { data } = await supabase
    .from("interview_attempts")
    .select("*")
    .eq("candidate_id", candidateId)
    .eq("status", "completed")
    .lt("attempt_number", attemptNumber)
    .order("attempt_number", { ascending: false })
    .limit(1);
  const row = data?.[0] ?? null;
  return { prior: rowToPrior(row), row };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function buildComparison(firstRow: any, currentRow: any) {
  const first = firstRow?.feedback;
  const current = currentRow?.feedback;
  if (!first || !current) return null;

  const firstTopics: any[] = first.topicPerformance ?? [];
  const currentTopics: any[] = current.topicPerformance ?? [];
  const byTopic = new Map(firstTopics.map((t) => [t.topic, t]));

  const topicComparison = currentTopics
    .filter((t) => byTopic.has(t.topic))
    .map((t) => {
      const prev = byTopic.get(t.topic)!;
      return {
        topic: t.topic,
        firstAccuracy: prev.accuracy,
        retakeAccuracy: t.accuracy,
        change: t.accuracy - prev.accuracy,
      };
    })
    .sort((a, b) => b.change - a.change);

  const mostImproved = topicComparison.length && topicComparison[0]!.change > 0 ? topicComparison[0] : null;
  const weakest = currentTopics.length
    ? [...currentTopics].sort((a, b) => a.accuracy - b.accuracy)[0]
    : null;

  const scoreImprovement = round1((current.overallScore ?? 0) - (first.overallScore ?? 0));
  const accuracyImprovement = (current.accuracy ?? 0) - (first.accuracy ?? 0);

  const acc = current.accuracy ?? 0;
  const status =
    acc >= 80
      ? "STRONG CANDIDATE"
      : accuracyImprovement > 0 && acc >= 60
        ? "GOOD PROGRESS"
        : acc >= 50
          ? "NEEDS IMPROVEMENT"
          : "KEEP PRACTICING";

  return {
    first: {
      attemptId: firstRow.attempt_id,
      attemptNumber: firstRow.attempt_number ?? 1,
      overallScore: first.overallScore,
      accuracy: first.accuracy,
    },
    retake: {
      attemptId: currentRow.attempt_id,
      attemptNumber: currentRow.attempt_number ?? 2,
      overallScore: current.overallScore,
      accuracy: current.accuracy,
    },
    scoreImprovement,
    accuracyImprovement,
    topicComparison,
    mostImproved,
    weakest,
    status,
  };
}

function finalStatus(accuracy: number) {
  if (accuracy >= 80) return "STRONG CANDIDATE";
  if (accuracy >= 65) return "GOOD PROGRESS";
  if (accuracy >= 50) return "NEEDS IMPROVEMENT";
  return "KEEP PRACTICING";
}

export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessionId = new URL(request.url).searchParams.get("sessionId");
        if (!sessionId) return json({ error: "sessionId is required" }, 400);
        const supabase = await db();
        const { data, error } = await supabase
          .from("interview_attempts")
          .select("*")
          .eq("session_id", sessionId)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Session not found" }, 404);

        const { row: priorRow } = await fetchPrior(
          supabase,
          (data as any).candidate_id ?? (data.candidate as any)?.id ?? null,
          (data as any).attempt_number ?? 1,
        );

        return json({
          sessionId: data.session_id,
          attemptId: data.attempt_id,
          attemptNumber: (data as any).attempt_number ?? 1,
          candidateId: (data as any).candidate_id ?? (data.candidate as any)?.id ?? null,
          candidate: data.candidate,
          turns: data.turns,
          status: data.status,
          feedback: data.feedback,
          finalStatus: data.feedback ? finalStatus((data.feedback as any).accuracy ?? 0) : null,
          previousAttempt: priorRow
            ? {
                attemptId: priorRow.attempt_id,
                attemptNumber: priorRow.attempt_number ?? 1,
                sessionId: priorRow.session_id,
                overallScore: priorRow.feedback?.overallScore ?? 0,
                accuracy: priorRow.feedback?.accuracy ?? 0,
                topicPerformance: priorRow.feedback?.topicPerformance ?? [],
              }
            : null,
          comparison: buildComparison(priorRow, data),
        });
      },


      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const sessionId = str(body?.sessionId);
        if (!sessionId) return json({ error: "sessionId is required" }, 400);
        const supabase = await db();

        const { data: existing } = await supabase
          .from("interview_attempts")
          .select("*")
          .eq("session_id", sessionId)
          .maybeSingle();

        // ---- Start interview -------------------------------------------------
        if (!existing) {
          if (!body?.candidate) return json({ error: "candidate is required to start" }, 400);
          const attemptId =
            str(body?.attemptId) || `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const candidateId = str(body?.candidateId) || str(body?.candidate?.id) || null;

          // Count previous attempts for this candidate — the first attempt is never overwritten.
          let attemptNumber = 1;
          let prior: PriorAttempt | null = null;
          if (candidateId) {
            const { count } = await supabase
              .from("interview_attempts")
              .select("id", { count: "exact", head: true })
              .eq("candidate_id", candidateId);
            attemptNumber = (count ?? 0) + 1;
            prior = (await fetchPrior(supabase, candidateId, attemptNumber)).prior;
          }

          let pending: Pending;
          try {
            pending = await generateQuestion(body.candidate, [], prior);
          } catch (e) {
            return aiErrorResponse(e, { sessionId, answered: 0 });
          }

          const { error } = await supabase.from("interview_attempts").insert({
            session_id: sessionId,
            attempt_id: attemptId,
            candidate_id: candidateId,
            attempt_number: attemptNumber,
            candidate: body.candidate,
            turns: [],
            pending,
            topics: [],
            status: "in_progress",
          });
          if (error) return json({ error: error.message }, 500);

          return json({
            reply: pending.question,
            done: false,
            sessionId,
            attemptId,
            attemptNumber,
            isRetake: attemptNumber > 1,
            question: pending,
            questionNumber: 1,
            totalQuestions: PRIMARY_QUESTIONS,
          });
        }


        if (existing.status === "completed") {
          return json({
            reply: "Interview completed.",
            done: true,
            sessionId,
            attemptId: existing.attempt_id,
            feedback: existing.feedback,
          });
        }

        const turns = (existing.turns ?? []) as Turn[];
        const pending = existing.pending as Pending | null;
        const candidate = existing.candidate as any;
        const message = str(body?.message);
        const { prior: activePrior } = await fetchPrior(
          supabase,
          (existing as any).candidate_id ?? candidate?.id ?? null,
          (existing as any).attempt_number ?? 1,
        );


        // Explicit end-interview request
        if (body?.end === true) {
          let feedback;
          try {
            feedback = turns.length
              ? await buildFeedback(candidate, turns)
              : {
                  summary: "The interview was ended before any question was answered.",
                  strengths: [],
                  gaps: [],
                  next: [],
                  topicsToImprove: [],
                  plan: [],
                  overallScore: 0,
                  accuracy: 0,
                  topicPerformance: [],
                  mistakes: [],
                };
          } catch (e) {
            // Keep the session open so the candidate can retry ending it later.
            return aiErrorResponse(e, {
              sessionId,
              answered: turns.length,
              question: pending,
            });
          }

          await supabase
            .from("interview_attempts")
            .update({ status: "completed", feedback, pending: null, updated_at: new Date().toISOString() })
            .eq("session_id", sessionId);
          return json({ reply: "Interview completed.", done: true, sessionId, feedback });
        }

        // No active question: a previous next-question generation failed (e.g. allowance
        // exhausted). Resume the same session instead of failing — nothing is lost.
        if (!pending) {
          if (turns.length >= PRIMARY_QUESTIONS) {
            return json({ error: "Interview already answered — request feedback." }, 409);
          }
          let resumed: Pending;
          try {
            resumed = await generateQuestion(candidate, turns, activePrior);
          } catch (e) {
            return aiErrorResponse(e, { sessionId, answered: turns.length });
          }
          await supabase
            .from("interview_attempts")
            .update({ pending: resumed, updated_at: new Date().toISOString() })
            .eq("session_id", sessionId);
          return json({
            reply: resumed.question,
            done: false,
            resumed: true,
            sessionId,
            attemptId: existing.attempt_id,
            question: resumed,
            questionNumber: resumed.index,
            totalQuestions: PRIMARY_QUESTIONS,
          });
        }

        // 1. Save the answer BEFORE evaluating so a failure never loses it.
        await supabase
          .from("interview_attempts")
          .update({ pending: { ...pending, answer: message }, updated_at: new Date().toISOString() })
          .eq("session_id", sessionId);

        // 2. Semantic evaluation
        let evaluation: Evaluation;
        try {
          evaluation = await evaluateAnswer(candidate, pending, message);
        } catch (e) {
          return aiErrorResponse(e, {
            sessionId,
            answered: turns.length,
            question: pending,
          });
        }


        // 3. Save score + topic performance
        const newTurns: Turn[] = [
          ...turns,
          {
            index: pending.index,
            question: pending.question,
            topic: pending.topic,
            difficulty: pending.difficulty,
            answer: message,
            evaluation,
          },
        ];

        // 4. Complete or continue — every answer always moves forward.
        if (newTurns.length >= PRIMARY_QUESTIONS) {
          const feedback = await buildFeedback(candidate, newTurns);
          await supabase
            .from("interview_attempts")
            .update({
              turns: newTurns,
              pending: null,
              topics: topicPerformance(newTurns),
              feedback,
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("session_id", sessionId);

          return json({
            reply: "Interview completed.",
            done: true,
            sessionId,
            attemptId: existing.attempt_id,
            evaluation,
            feedback,
          });
        }

        let nextPending: Pending;
        try {
          nextPending = await generateQuestion(candidate, newTurns, activePrior);
        } catch (e) {
          // Answer + score are kept; the candidate can retry generating the next question.
          await supabase
            .from("interview_attempts")
            .update({
              turns: newTurns,
              pending: null,
              topics: topicPerformance(newTurns),
              updated_at: new Date().toISOString(),
            })
            .eq("session_id", sessionId);
          return aiErrorResponse(e, {
            sessionId,
            answered: newTurns.length,
            evaluation,
          });

        }

        await supabase
          .from("interview_attempts")
          .update({
            turns: newTurns,
            pending: nextPending,
            topics: topicPerformance(newTurns),
            updated_at: new Date().toISOString(),
          })
          .eq("session_id", sessionId);

        return json({
          reply: nextPending.question,
          done: false,
          sessionId,
          attemptId: existing.attempt_id,
          evaluation,
          question: nextPending,
          questionNumber: nextPending.index,
          totalQuestions: PRIMARY_QUESTIONS,
        });
      },
    },
  },
});
