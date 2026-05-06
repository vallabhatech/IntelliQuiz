# IntelliQuiz — AI-Powered Live Quiz Platform

A production-ready multiplayer quiz platform where admins generate MCQ questions using Google Gemini AI and host live real-time quiz sessions with animated leaderboards.

<img src="public/Screenshot from 2026-06-15 17-15-16.png" alt="IntelliQuiz Landing Page" width="100%"/>

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Scoring Algorithm](#scoring-algorithm)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [Deployment](#deployment)
- [Database Scripts](#database-scripts)

---

## Features

- **AI Quiz Generation** — Enter a topic prompt, select difficulty & question count → Gemini generates MCQs with explanations in under 5 seconds
- **Live Multiplayer Sessions** — Students join with a 6-character room code; questions sync in real time via Socket.IO
- **Live Leaderboard** — Animated rankings with speed bonus and streak multipliers update after every answer
- **Role-based Auth** — Admins create and host quizzes; students join and play
- **Dark Glassmorphism UI** — Modern dark design with electric violet accent and Framer Motion animations

---

## Screenshots

### Admin Dashboard
<img src="public/Screenshot from 2026-06-15 17-23-15.png" alt="Admin Dashboard" width="100%"/>

### Create Quiz with AI
<img src="public/Screenshot from 2026-06-15 17-24-43.png" alt="Create Quiz" width="100%"/>

### AI-Generated Questions Preview
<img src="public/Screenshot from 2026-06-15 17-29-06.png" alt="Generated Questions" width="100%"/>

### Live Quiz Session with Leaderboard
<img src="public/Screenshot from 2026-06-15 17-33-42.png" alt="Live Session" width="100%"/>

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | Auth.js v5 (Google OAuth + Credentials) |
| Real-time | Socket.IO v4 (custom Node.js server) |
| AI | Google Gemini 2.0 Flash |
| Animations | Framer Motion |
| Caching | Redis (ioredis) |
| Validation | Zod |
| Notifications | Sonner |

---

## How It Works

### Admin Flow
1. Sign in with an admin account
2. **Create Quiz** → enter a title, describe the topic, select difficulty, question count, and timer duration
3. Gemini AI generates MCQs with explanations instantly
4. Review all generated questions on the quiz detail page
5. **Start Session** → a 6-character room code is generated
6. Host the live session — control Next / Pause / Resume and watch the live leaderboard update in real time

### Student Flow
1. Sign in (Google OAuth or email/password)
2. Go to `/join` and enter the room code shared by the host
3. Wait in the lobby until the host starts the session
4. Answer each question within the countdown timer
5. See your score and a Gemini-generated explanation after each answer
6. Final leaderboard is revealed when the quiz ends

---

## Scoring Algorithm

| Bonus | Formula |
|---|---|
| Base points | 1,000 per correct answer |
| Speed bonus | `(timeLimit - timeTaken) / timeLimit × 500` |
| Streak bonus | `min(streak, 5) × 100` |
| Wrong answer | 0 points, streak resets |

Maximum possible score per question: **1,600 points** (instant correct answer with a 5+ streak)

---

## Project Structure

```
├── server.ts                  # Custom HTTP + Socket.IO entry point
├── server/
│   └── socket-server.ts       # All real-time event handlers
├── prisma/
│   └── schema.prisma          # Database schema
├── middleware.ts              # Route protection
├── app/
│   ├── (auth)/                # Login, Register pages
│   ├── (dashboard)/           # Admin dashboard + quiz management
│   ├── (student)/             # Join room + play quiz
│   └── api/                   # REST API routes
├── components/
│   ├── auth/                  # Auth forms + providers
│   ├── dashboard/             # Stats, sidebar, analytics
│   ├── quiz/                  # Quiz cards, form, question editor
│   ├── session/               # Live host/student views, timer, answers
│   ├── leaderboard/           # Animated live leaderboard
│   └── ui/                    # shadcn/ui components
├── hooks/
│   ├── useSocket.ts
│   ├── useTimer.ts
│   └── useLeaderboard.ts
├── lib/                       # auth, prisma, gemini, redis, socket, validations
└── types/                     # Shared TypeScript types
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (recommended: [Neon](https://neon.tech) — free tier works)
- Redis instance (local or [Upstash](https://upstash.com))
- Google OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone and install

```bash
git clone <repo-url>
cd IntelliQuiz
npm install
```

### 2. Environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Run `npx auth secret` to generate |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3000` for local dev |
| `REDIS_URL` | Redis connection string |

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Create an admin account

Register an account normally, then promote it to admin via Prisma Studio:

```bash
npx prisma studio
# Open the User table → change role from STUDENT to ADMIN
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** `npm run dev` runs `tsx server.ts` (not `next dev`) because Socket.IO needs access to the raw HTTP server.

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable the Google OAuth API
3. Create OAuth 2.0 credentials (Web application type)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Secret into `.env.local`

---

## Deployment

### Railway (recommended — full WebSocket support)

1. Push to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a PostgreSQL and Redis plugin
4. Set all environment variables in the Railway dashboard
5. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Railway domain
6. Update the Google OAuth redirect URI to `https://your-domain.railway.app/api/auth/callback/google`

### Vercel + Neon

1. Push to GitHub and import the project on [Vercel](https://vercel.com)
2. Add all environment variables in the Vercel dashboard
3. Use [Neon](https://neon.tech) for PostgreSQL and [Upstash](https://upstash.com) for Redis

> Socket.IO on Vercel falls back to HTTP long-polling since serverless functions don't support persistent WebSocket connections. For full WebSocket support deploy on Railway, Render, or a VPS.

---

## Database Scripts

```bash
npm run db:migrate    # Run migrations (development)
npm run db:push       # Push schema changes without a migration file
npm run db:studio     # Open Prisma Studio
npm run db:generate   # Regenerate Prisma client
```
