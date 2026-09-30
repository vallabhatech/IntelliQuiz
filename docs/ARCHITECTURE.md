# IntelliQuiz Architecture

## 1. Overview

IntelliQuiz is a full-stack quiz platform built around a Next.js application and a custom Node.js HTTP server. The same server hosts Next.js request handling and a Socket.IO server for live quiz sessions.

Core layers:
- Web application: Next.js 15, React 19, TypeScript
- Authentication: Auth.js / NextAuth with Prisma adapter
- API and server logic: Next.js routes plus server-side modules
- Real-time transport: Socket.IO over WebSocket with polling fallback
- Persistence: PostgreSQL through Prisma
- AI generation: Groq as the primary provider and Google Gemini as a fallback
- Caching: Redis is supported for leaderboard/session-related acceleration
- UI: Tailwind CSS, shadcn/ui, Framer Motion, Lucide

## 2. Runtime flow

Browser
  |
  +-- Next.js pages / API
  |      |
  |      +-- Auth.js -> PostgreSQL
  |      +-- Quiz APIs -> Prisma -> PostgreSQL
  |      +-- AI generation -> Groq / Gemini
  |
  +-- Socket.IO
         |
         +-- Custom Node HTTP server
                 |
                 +-- live session state
                 +-- persistence through application services

The custom server is important because Socket.IO is initialized on the same HTTP server used by Next.js.

## 3. Authentication and authorization

middleware.ts protects dashboard routes and redirects unauthenticated users to the login page. Auth.js configuration and Prisma-backed account/session models handle authentication state.

The data model distinguishes:
- ADMIN users who create/host quizzes
- STUDENT users who participate in quizzes

Authorization should remain enforced server-side; hiding a UI control is not a security boundary.

## 4. Quiz and session data model

The Prisma schema defines the main relationships:

User
  |
  +-- Quiz -- Question
  |
  +-- QuizSession
        |
        +-- Participant -- Answer

Important state machines:
- Quiz: DRAFT -> ACTIVE -> PAUSED -> COMPLETED
- Session: WAITING -> ACTIVE -> PAUSED -> COMPLETED

The schema uses cascading deletes for dependent quiz/session records and uniqueness constraints for values such as email, room codes, participant membership, and one answer per participant/question.

## 5. AI question generation

The configured provider strategy is:
1. Attempt generation through Groq.
2. Fall back to Gemini when the primary provider cannot complete the request.
3. Validate generated data before it is used by the application.

API keys belong only in environment variables. They must never be exposed through client bundles or committed to Git.

## 6. Live quiz sessions

Socket.IO handles real-time events such as room participation, question progression, answers, scoring, and leaderboard updates.

The transport configuration allows:
- WebSocket for persistent real-time communication
- HTTP polling as a fallback

A live session should be treated as distributed state: clients can disconnect, reconnect, or send stale events. Server-side validation should remain authoritative.

## 7. Persistence and caching

PostgreSQL is the durable system of record. Prisma provides the application data-access layer.

Redis is optional in the current configuration. Where Redis is used for acceleration, it should be treated as a cache rather than the authoritative source of quiz history.

For larger deployments, the next scaling step is to remove assumptions that live session state exists only inside one Node process. A shared state/event layer is required before safely running multiple application instances.

## 8. Deployment model

railway.json uses Nixpacks for building and starts the application with npm start. The production server binds to 0.0.0.0 and uses the PORT environment variable when provided.

The application expects production configuration for:
- AUTH_SECRET
- Google OAuth credentials
- DATABASE_URL
- AI provider keys
- public application/socket URLs

The repository README documents Railway as the preferred deployment path for full Socket.IO support and describes Vercel as an alternative with transport limitations.

## 9. Scaling considerations

Current architecture is suitable for a single application process, but horizontal scaling introduces additional requirements:
1. Shared Socket.IO state: use a Socket.IO adapter or equivalent shared coordination layer.
2. Shared session state: avoid process-local state for data that must survive across instances.
3. Database pooling: use a production PostgreSQL pooler where required by the hosting provider.
4. Cache discipline: define TTLs and invalidation rules for Redis-backed data.
5. Rate limiting: protect authentication, AI generation, room joining, and other externally reachable endpoints.
6. Observability: add structured logs, error tracking, health checks, and latency metrics.
7. Background work: move expensive AI generation or analytics workloads to a queue when request latency becomes a constraint.
8. Idempotency: protect answer submission and session transitions from duplicate or replayed requests.

These are architectural directions, not claims that every item is already implemented.

## 10. Change checklist

When changing IntelliQuiz:
- Update Prisma schema and migration strategy together.
- Keep Socket.IO event contracts compatible between server and clients.
- Validate authorization at the server boundary.
- Keep AI provider credentials server-side.
- Document deployment-impacting environment variables.
- Update README and changelog for user-visible or operational changes.

## 11. Source of truth

This guide is based on the repository's current structure and configuration. If documentation and implementation disagree, inspect the code and configuration first and correct the documentation.
