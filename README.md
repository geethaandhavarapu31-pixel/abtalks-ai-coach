# AI Interview Coach

https://ai-interview-coach-664.lovable.app/
UPGRADE MY EXISTING LOVABLE PROJECT INTO:

AB TALKS — AI INTERVIEW AGENT

IMPORTANT:

This is an EXISTING working Lovable project.

DO NOT create a new project.

DO NOT rebuild from scratch.

DO NOT delete existing working functionality.

DO NOT replace the current design unnecessarily.

First inspect the existing project, routes, components, backend, Supabase configuration, APIs, and existing files.

Preserve the existing working architecture and visual identity.

The project already contains:

- curriculum.json

- candidates.json

- technical-specs.md

Use these files as the SOURCE OF TRUTH.

DO NOT:

- create fake candidates

- invent candidate information

- invent courses or skills

- invent curriculum topics

- hard-code candidates

- hard-code interview questions

- replace the supplied files with fake data

If information is unavailable, display:

"Not specified"

==================================================

1. COMPLETE FLOW

==================================================

Implement:

Welcome

↓

Start Interview

↓

Select Candidate

↓

Candidate Profile

↓

Enter Test

↓

AI Technical Interview

↓

Candidate Answer

↓

Gemini Semantic Evaluation

↓

Automatically Next Question

↓

Minimum 8 Primary Questions

↓

Interview Completed

↓

Separate AI Feedback Page

==================================================

2. WELCOME PAGE

==================================================

Create a premium welcome screen.

Display:

Welcome to AB Talks

AI-Powered Technical Interview Platform

"Experience a personalized AI technical interview based on your

skills, learning progress, courses, and curriculum."

Button:

START INTERVIEW

Add small text:

AI TECHNICAL INTERVIEW AGENT

Use an attractive professional AI background:

- dark navy/black gradient

- blue and purple glow

- subtle circuit patterns

- subtle AI/neural network elements

- elegant glassmorphism

- premium typography

- clean layout

Do not use distracting animations.

Make it responsive.

==================================================

3. CANDIDATE SELECTION

==================================================

Load candidates dynamically from candidates.json.

Do NOT hard-code candidates.

Show candidate cards containing available information such as:

- Name

- Domain

- Progress

- Completed topics

Clicking a candidate opens:

CANDIDATE PROFILE

==================================================

4. CANDIDATE PROFILE

==================================================

Use only:

- candidates.json

- curriculum.json

- technical-specs.md

Show available:

- Name

- Domain

- Experience

- Courses

- Languages

- Technologies

- Skills

- Completed topics

- Learning progress

- Relevant curriculum

Missing information:

"Not specified"

Show technical skills as badges.

Show progress as a progress bar.

Button:

ENTER THE TEST

==================================================

5. INTERVIEW SESSION

==================================================

When interview starts create:

sessionId

attemptId

Maintain the same sessionId throughout the interview.

Each attempt must have a unique attemptId.

Store:

- questions

- answers

- scores

- topics

- difficulty

- strengths

- weaknesses

- missing concepts

- candidate

- sessionId

- attemptId

Use the existing Supabase/backend architecture if available.

Do not rely only on temporary frontend state for completed attempts.

==================================================

6. INTERVIEW SCREEN

==================================================

Display:

AB TALKS

AI TECHNICAL INTERVIEW

Candidate: [name]

Question X / 8+

Progress bar

Current Topic: [topic]

Difficulty: Basic / Easy / Moderate

AI Question

Answer box:

"Type your answer here..."

Button:

SUBMIT ANSWER

Also provide:

END INTERVIEW

While Gemini is evaluating:

"AI is evaluating your answer..."

Disable submit temporarily to prevent duplicate requests.

==================================================

7. QUESTION GENERATION

==================================================

Every question must be generated dynamically by Gemini.

Questions may ONLY come from:

- candidate domain

- candidate courses

- candidate skills

- completed topics

- relevant curriculum

Never ask unrelated subjects.

Do not hard-code questions.

==================================================

8. DIFFICULTY

==================================================

ONLY use:

Basic

Easy

Moderate

Never generate:

Advanced

Expert

Difficult

Start with a simple fundamental question.

==================================================

9. ADAPTIVE DIFFICULTY

==================================================

Score 0–3:

Next question = Basic/Easy, preferably weak topic.

Score 4–6:

Next = Easy/Moderate.

Score 7–8:

Next = Moderate.

Score 9–10:

Next = Moderate or slightly application-oriented.

Never jump to advanced questions.

==================================================

10. EVERY ANSWER MUST CONTINUE

==================================================

This is a mandatory rule.

Every submitted answer MUST move the interview forward.

Examples:

10 → next question

8 → next question

6 → next question

3 → next question

0 → next question

Never block the candidate.

Never require a correct answer.

Never require 80%.

Never ask the candidate to correct the previous answer.

Pipeline:

SUBMIT

↓

SAVE ANSWER

↓

GEMINI EVALUATION

↓

SAVE SCORE

↓

UPDATE TOPIC PERFORMANCE

↓

GENERATE NEXT QUESTION

↓

CONTINUE

==================================================

11. SEMANTIC EVALUATION

==================================================

Do NOT use exact string matching.

Evaluate the technical meaning.

Consider:

- conceptual meaning

- correctness

- important concepts

- completeness

- valid examples

- technical understanding

Different wording must receive credit if the meaning is correct.

Do not penalize heavily for:

- grammar

- simple English

- different sentence structure

- different wording

- shorter valid explanation

==================================================

12. 80% CONCEPT RULE

==================================================

If approximately 80% or more of the important concepts are correctly

demonstrated, consider the answer correct/mostly correct and give

an appropriately high score.

This means conceptual coverage, NOT keyword matching.

IMPORTANT:

The 80% rule affects ONLY scoring.

It NEVER controls navigation.

Even a 0/10 answer must continue to the next question.

==================================================

13. GEMINI EVALUATION JSON

==================================================

Ask Gemini to return structured data:

{

  "score": 0,

  "status": "correct",

  "reason": "",

  "strengths": [],

  "missingConcepts": [],

  "incorrectConcepts": [],

  "followUpNeeded": false,

  "followUpReason": ""

}

Allowed status:

correct

mostly_correct

partially_correct

incorrect

Scoring:

9–10 = correct and complete

7–8 = mostly correct

5–6 = partial understanding

3–4 = major gaps/confusion

0–2 = incorrect/irrelevant/very little understanding

Score technical understanding, NOT English quality.

==================================================

14. FOLLOW-UP

==================================================

A follow-up question may be generated when concepts are missing.

Example:

"What is inheritance?"

Partial answer.

Next question:

"Can you give a simple example of inheritance?"

Do not repeat the exact same question.

The follow-up counts as the next question.

==================================================

15. MEMORY

==================================================

Maintain interview context:

- previous questions

- previous answers

- scores

- topics

- strengths

- weaknesses

- missing concepts

- difficulty

Never repeat the exact same question within one attempt.

==================================================

16. MINIMUM INTERVIEW

==================================================

Conduct at least:

8 PRIMARY QUESTIONS.

Try to cover at least 4 relevant topics if available.

If fewer topics exist, use the available relevant topics.

Do not invent topics.

==================================================

17. FEEDBACK PAGE

==================================================

After the interview:

Show:

INTERVIEW COMPLETED SUCCESSFULLY

Navigate to a separate:

AI INTERVIEW FEEDBACK

Show:

OVERALL SCORE

X / 10

Calculate from actual primary-question scores.

Also calculate:

ACCURACY = (average score / 10) × 100

Show:

OVERALL ACCURACY: X%

==================================================

18. TOPIC PERFORMANCE

==================================================

For every tested topic show:

- Topic

- Questions

- Average score

- Accuracy

- Status

Example:

Python Basics — 80% — Good

OOP — 55% — Needs Improvement

Only show actually tested topics.

==================================================

19. STRENGTHS

==================================================

Show:

YOUR STRENGTHS

Generate from actual answers.

Do not give unsupported generic praise.

==================================================

20. MISTAKES

==================================================

Show:

WHERE YOU MADE MISTAKES

For incorrect/partial answers display:

Question

Your Answer

Score

What Was Wrong

Correct Concept

How to Improve

Use the candidate's actual answer.

==================================================

21. IMPROVEMENT AREAS

==================================================

Show:

TOPICS TO IMPROVE

Only use weak topics supported by:

- candidate data

- curriculum

- actual interview performance

Prioritize:

1. lowest accuracy

2. repeated mistakes

3. missing concepts

==================================================

22. PERSONALIZED PLAN

==================================================

Show:

HOW YOU CAN IMPROVE

Generate recommendations based on actual mistakes.

Do not invent unrelated topics.

==================================================

23. SECURITY

==================================================

Never expose the Gemini API key in frontend code.

Use secure backend/server-side integration.

Preserve existing Supabase architecture if available.

==================================================

24. ERROR HANDLING

==================================================

If Gemini fails:

- save the candidate answer first

- show a professional error

- allow retry

- do not duplicate the question

- do not reset the interview

If Gemini returns invalid JSON, safely handle/retry it.

==================================================

25. API CONTRACT

==================================================

Follow technical-specs.md.

Expose:

POST /api/interview

Use sessionId throughout the interview.

Initial request:

{

  "sessionId": "abc-123",

  "candidate": { ...candidate.json }

}

Subsequent request:

{

  "sessionId": "abc-123",

  "message": "candidate answer"

}

Final response must contain:

{

  "reply": "Interview completed.",

  "done": true,

  "feedback": {

    "summary": "...",

    "strengths": [],

    "gaps": [],

    "next": []

  }

}

==================================================

26. FINAL REQUIREMENT

==================================================

Before finishing, test the complete flow:

Welcome

→ Start

→ Candidate Selection

→ Candidate Profile

→ Enter Test

→ Gemini Question

→ Submit ANY Answer

→ Semantic Evaluation

→ Score Saved

→ Next Question

→ Minimum 8 Questions

→ Interview Completed

→ Feedback Page

Do not sacrifice functionality for visual effects.

Make the core interview reliable first.

==================================================

IMPORTANT FINAL RULE:

EVERY ANSWER MUST MOVE FORWARD.

SUBMIT

→ SEMANTIC EVALUATION

→ SAVE

→ NEXT QUESTION

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://abtalks-ai-coach.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/81fa43fd-0518-46ea-98e8-c162168437b4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
