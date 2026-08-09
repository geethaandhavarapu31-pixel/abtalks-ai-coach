# AB TALKS — AI Interview Agent

AB TALKS is an AI-powered technical interview platform that gives candidates a personalized interview based on their skills, courses, completed topics, and curriculum.

## 🚀 Live Demo

https://abtalks-ai-coach.lovable.app/

## 💡 How It Works

```text
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
AI Generates Question
   ↓
Candidate Answers
   ↓
Gemini Evaluates Answer
   ↓
Score + Performance Saved
   ↓
Next Question
   ↓
8+ Questions
   ↓
Interview Completed
   ↓
AI Interview Feedback
```

## ✨ Features

* Personalized AI technical interviews
* Dynamic candidate selection
* Questions based on candidate skills and curriculum
* Gemini semantic answer evaluation
* Adaptive question difficulty
* Minimum 8 primary questions
* Interview session and attempt tracking
* Topic-wise performance
* Strengths and weaknesses
* Mistake analysis
* Personalized improvement suggestions
* Separate AI feedback page
* Responsive UI

## 🧠 AI Interview Flow

The interview uses the candidate's actual data instead of hard-coded questions.

```text
Candidate Data
      ↓
Skills + Courses + Completed Topics
      ↓
Gemini Generates Question
      ↓
Candidate Answer
      ↓
Gemini Evaluates Meaning
      ↓
Score + Strengths + Missing Concepts
      ↓
Next Question
```

The system evaluates the **technical meaning** of an answer instead of checking exact keywords. Grammar or different wording does not heavily affect the technical score.

Every answer moves the interview forward, even if the score is `0/10`.

## 📊 Feedback

After the interview, the candidate gets:

* Overall score
* Overall accuracy
* Topic performance
* Strengths
* Mistakes
* Missing concepts
* Topics to improve
* Personalized improvement suggestions

## 📂 Source Data

The project uses these files as the source of truth:

```text
curriculum.json
candidates.json
technical-specs.md
```

No fake candidates, courses, skills, or curriculum topics are added.

If information is not available:

```text
Not specified
```

## 🛠️ Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Gemini API
* Supabase
* Lovable
* GitHub

## 🔐 Security

The Gemini API key is handled on the server side and should never be exposed in frontend code.

Environment variables and API keys should not be committed to GitHub.

## 💻 Run Locally

```bash
git clone <your-repository-url>
cd <repository-name>
npm install
npm run dev
```

Add the required environment variables before running the application.

## 🤖 Built with Lovable

This project was built and improved using Lovable.

The development prompts used during the project are documented in:

**[PROMPTS.md](./PROMPTS.md)**

## 👩‍💻 Project

**AB TALKS — AI Interview Agent**

An AI-powered platform for practicing technical interviews with personalized questions and AI feedback.
