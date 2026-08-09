# PROMPTS.md

# AB TALKS — AI Interview Agent

This file contains the main prompts I used with Lovable while building and improving **AB TALKS — AI Interview Agent**.

I started with an existing Lovable project and used prompts to gradually improve the UI, interview flow, evaluation logic, and feedback system.

---

## Prompt 1 — Upgrade the Existing Project

I already have a working Lovable project.

I want to upgrade this existing project into:

**AB TALKS — AI INTERVIEW AGENT**

Please do not create a new project or rebuild everything from scratch.

First inspect the existing project, components, routes, backend, Supabase setup, APIs, and existing files.

Keep the existing working functionality and design wherever possible.

The project already contains:

* `curriculum.json`
* `candidates.json`
* `technical-specs.md`

Use these files as the source of truth.

Do not create fake candidates, fake courses, fake skills, fake curriculum topics, or hard-coded interview questions.

If information is not available, display:

`Not specified`

---

## Prompt 2 — Build the Interview Flow

Now implement the complete interview flow.

The flow should be:

```text
Welcome
→ Start Interview
→ Select Candidate
→ Candidate Profile
→ Enter Test
→ AI Technical Interview
→ Candidate Answer
→ Gemini Evaluation
→ Next Question
→ 8+ Questions
→ Interview Completed
→ AI Feedback
```

Every answer must move the interview forward.

The basic flow should be:

```text
Submit Answer
→ Save Answer
→ Evaluate with Gemini
→ Save Score
→ Update Performance
→ Generate Next Question
```

Even if the candidate gets `0/10`, the interview should continue.

---

## Prompt 3 — Candidate Selection and Profile

Update the candidate selection page.

Load candidates dynamically from `candidates.json`.

Do not hard-code candidates.

Show the information that is actually available, such as:

* Name
* Domain
* Progress
* Completed topics

When a candidate is selected, show a detailed candidate profile.

Use information from:

* `candidates.json`
* `curriculum.json`
* `technical-specs.md`

Show available skills, technologies, courses, completed topics, experience, languages, and learning progress.

If something is missing, show `Not specified`.

---

## Prompt 4 — Make Questions Dynamic

I don't want hard-coded interview questions.

Generate every technical interview question dynamically using Gemini.

Questions should only be related to the selected candidate's:

* Domain
* Skills
* Courses
* Completed topics
* Relevant curriculum

Do not ask unrelated questions.

Use only these difficulty levels:

* Basic
* Easy
* Moderate

Start with a simple fundamental question.

---

## Prompt 5 — Add Adaptive Difficulty

Make the interview adaptive based on the candidate's previous score.

Use this logic:

```text
0–3  → Basic / Easy
4–6  → Easy / Moderate
7–8  → Moderate
9–10 → Moderate / Application-based
```

Never generate Advanced, Expert, or Difficult questions.

The interview should become more or less challenging based on the candidate's performance.

---

## Prompt 6 — Fix Answer Evaluation

Improve the answer evaluation.

Do not compare the candidate's answer using exact keywords or string matching.

Gemini should evaluate the technical meaning of the answer.

Consider:

* Conceptual understanding
* Correctness
* Important concepts
* Completeness
* Examples
* Technical understanding

Different wording should still receive credit if the technical meaning is correct.

Do not heavily penalize grammar or simple English mistakes.

---

## Prompt 7 — Add Structured Gemini Evaluation

Make Gemini return structured JSON after evaluating every answer.

Use this format:

```json
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
```

Allowed statuses:

```text
correct
mostly_correct
partially_correct
incorrect
```

The score should represent technical understanding rather than English quality.

---

## Prompt 8 — Make Sure Every Answer Continues

There is an important issue I want to avoid.

Every submitted answer must move to the next question.

For example:

```text
10 → next question
8  → next question
6  → next question
3  → next question
0  → next question
```

Do not block the candidate based on their score.

Do not require a correct answer.

Do not require 80% to continue.

The 80% concept rule should affect the score only, never the navigation.

---

## Prompt 9 — Add Interview Memory

Maintain the interview context throughout one attempt.

Remember:

* Previous questions
* Previous answers
* Scores
* Topics
* Strengths
* Weaknesses
* Missing concepts
* Difficulty

Create a `sessionId` for the interview.

Create a unique `attemptId` for every attempt.

Do not repeat the exact same question during the same attempt.

---

## Prompt 10 — Add Minimum Questions

The interview should contain at least 8 primary questions.

Try to cover at least 4 relevant topics when enough topics are available.

If the candidate has fewer relevant topics, use the available topics.

Do not invent topics just to reach the question count.

---

## Prompt 11 — Add Follow-Up Questions

If the candidate gives a partially correct answer and some important concept is missing, Gemini can generate a follow-up question.

For example:

```text
Question:
What is inheritance?

Candidate:
[partial answer]

Follow-up:
Can you give a simple example of inheritance?
```

The follow-up should count as the next question.

Do not ask the exact same question again.

---

## Prompt 12 — Build the Feedback Page

After the interview is completed, create a separate AI Interview Feedback page.

Show:

```text
Overall Score
Overall Accuracy
Topic Performance
Strengths
Mistakes
Topics to Improve
Personalized Improvement Plan
```

Calculate the overall score from the actual interview scores.

Use the candidate's real answers and performance.

Do not show generic feedback that is not supported by the interview.

---

## Prompt 13 — Improve Mistake Analysis

For incorrect and partially correct answers, show:

* Question
* Candidate's answer
* Score
* What was wrong
* Correct concept
* How to improve

Use the actual answer given by the candidate.

Also identify missing concepts from Gemini's evaluation.

---

## Prompt 14 — Improve the UI

Now improve the UI without changing the existing functionality.

Make the application look like a premium AI interview platform.

Use:

* Dark navy/black background
* Blue and purple glow
* Glassmorphism
* Clean cards
* Modern typography
* Subtle AI/circuit elements
* Responsive design

Keep animations subtle and professional.

Do not add unnecessary visual effects that affect usability.

---

## Prompt 15 — Improve Error Handling

Handle Gemini failures properly.

If Gemini fails:

1. Save the candidate's answer first.
2. Show a clear error message.
3. Allow the user to retry.
4. Do not reset the interview.
5. Do not duplicate the question.

If Gemini returns invalid JSON, safely handle the error and retry when appropriate.

---

## Prompt 16 — Secure the Gemini API

Make sure the Gemini API key is never exposed in frontend code.

Use server-side integration for Gemini requests.

Check the existing backend and Supabase architecture before making changes.

Do not expose secrets through client-side environment variables.

---

## Prompt 17 — Test the Complete Flow

Before finishing, test the complete interview flow from beginning to end.

Test:

```text
Welcome
→ Start
→ Candidate Selection
→ Candidate Profile
→ Enter Test
→ AI Question
→ Submit Answer
→ Gemini Evaluation
→ Score Saved
→ Next Question
→ 8+ Questions
→ Interview Completed
→ Feedback Page
```

Test with different answer qualities, including:

* Correct answer
* Partially correct answer
* Incorrect answer
* Very short answer

Make sure every answer continues to the next question.

---

## Prompt 18 — Final Reliability Check

Now review the entire application.

Focus on functionality before visual improvements.

Check:

* Candidate data is coming from the provided files.
* Questions are generated dynamically.
* Gemini evaluation is semantic.
* Scores are saved.
* Interview state is maintained.
* Questions are not unnecessarily repeated.
* At least 8 primary questions are completed.
* Every answer moves forward.
* Feedback is based on actual performance.
* Gemini API keys are protected.
* Errors do not reset the interview.

Fix any issues you find without removing existing working functionality.

---

## Development Approach

I used Lovable iteratively rather than trying to build everything in one prompt.

The general process was:

```text
Existing Lovable Project
        ↓
Understand Existing Code
        ↓
Add Interview Flow
        ↓
Connect Candidate Data
        ↓
Add Gemini Questions
        ↓
Add Answer Evaluation
        ↓
Add Adaptive Logic
        ↓
Add Interview Memory
        ↓
Add Feedback
        ↓
Fix Errors
        ↓
Improve UI
        ↓
Test Complete Flow
```

The goal was to build the project step by step while keeping the existing application working.
