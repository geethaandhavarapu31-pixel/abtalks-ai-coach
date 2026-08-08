import candidatesJson from "@/data/candidates.json";
import curriculumJson from "@/data/curriculum.json";

export const NOT_SPECIFIED = "Not specified";

export type Mission = {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
};

export type RawCandidate = {
  member: {
    id: string;
    name?: string;
    jobRole?: string;
    yearsExperience?: number;
    education?: string;
    status?: string;
  };
  missions?: Mission[];
  signals?: {
    commitDays?: number;
    missionsCompleted?: number;
    missionsFirstTry?: number;
  };
};

export type CurriculumDay = {
  day: number;
  title: string;
  type?: string;
  tools?: string[];
  objectives?: string[];
};

export type CurriculumModule = { n: number; title: string; days: number[] };

const curriculum = curriculumJson as {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
};

export const cohortLabel: string = curriculum.cohort ?? NOT_SPECIFIED;
export const curriculumDays: CurriculumDay[] = curriculum.days ?? [];
export const curriculumModules: CurriculumModule[] = curriculum.modules ?? [];

export const rawCandidates: RawCandidate[] = (
  candidatesJson as { candidates: RawCandidate[] }
).candidates;

export function dayInfo(day: number): CurriculumDay | undefined {
  return curriculumDays.find((d) => d.day === day);
}

export function moduleForDay(day: number): CurriculumModule | undefined {
  return curriculumModules.find((m) => day >= (m.days?.[0] ?? 0) && day <= (m.days?.[1] ?? 0));
}

export type TopicEntry = {
  day: number;
  title: string;
  module: string;
  tools: string[];
  objectives: string[];
  attempts: number | null;
  strong: boolean;
};

export type CandidateProfile = {
  id: string;
  name: string;
  domain: string;
  experience: string;
  education: string;
  status: string;
  cohort: string;
  totalDays: number;
  missionsCompleted: number | null;
  missionsFirstTry: number | null;
  commitDays: number | null;
  progressPercent: number;
  completedTopics: TopicEntry[];
  weakTopics: TopicEntry[];
  skills: string[];
  raw: RawCandidate;
};

function toTopic(mission: Mission): TopicEntry {
  const info = dayInfo(mission.day);
  return {
    day: mission.day,
    title: mission.title || info?.title || NOT_SPECIFIED,
    module: moduleForDay(mission.day)?.title ?? NOT_SPECIFIED,
    tools: info?.tools ?? [],
    objectives: info?.objectives ?? [],
    attempts: typeof mission.attempts === "number" ? mission.attempts : null,
    strong: mission.passed === true && (mission.attempts ?? 99) <= 2,
  };
}

export function buildProfile(candidate: RawCandidate): CandidateProfile {
  const missions = candidate.missions ?? [];
  const passed = missions.filter((m) => m.passed === true);
  const weak = missions.filter((m) => m.passed !== true || (m.attempts ?? 0) >= 3);

  const completedTopics = passed.map(toTopic);
  const skills = Array.from(new Set(completedTopics.flatMap((t) => t.tools))).sort();
  const totalDays = curriculumDays.length || 31;
  const completedCount = candidate.signals?.missionsCompleted ?? passed.length;

  return {
    id: candidate.member.id,
    name: candidate.member.name || NOT_SPECIFIED,
    domain: candidate.member.jobRole || NOT_SPECIFIED,
    experience:
      typeof candidate.member.yearsExperience === "number"
        ? `${candidate.member.yearsExperience} years`
        : NOT_SPECIFIED,
    education: candidate.member.education || NOT_SPECIFIED,
    status: candidate.member.status || NOT_SPECIFIED,
    cohort: cohortLabel,
    totalDays,
    missionsCompleted: candidate.signals?.missionsCompleted ?? null,
    missionsFirstTry: candidate.signals?.missionsFirstTry ?? null,
    commitDays: candidate.signals?.commitDays ?? null,
    progressPercent: Math.min(100, Math.round((completedCount / totalDays) * 100)),
    completedTopics,
    weakTopics: weak.map(toTopic),
    skills,
    raw: candidate,
  };
}

export const profiles: CandidateProfile[] = rawCandidates.map(buildProfile);

export function getProfile(id: string): CandidateProfile | undefined {
  return profiles.find((p) => p.id === id);
}
