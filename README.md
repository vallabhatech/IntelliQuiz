# IntelliQuiz — AI-Powered Live Quiz Platform

![IntelliQuiz Logo](https://via.placeholder.com/150?text=IQ)

A production-ready multiplayer quiz platform where admins generate MCQ questions using AI (Groq/Gemini) and host live real-time quiz sessions with animated leaderboards.

---

## 📋 Short Description

IntelliQuiz is a comprehensive quiz platform that leverages AI to generate multiple-choice questions instantly. Admins can create quizzes on any topic, host live sessions with real-time synchronization via Socket.IO, and track player performance with an animated leaderboard featuring speed and streak bonuses.

---

## ✨ Features

- **🤖 AI Quiz Generation** — Enter a topic prompt, select difficulty & question count → AI generates MCQs with explanations in under 5 seconds
- **🎮 Live Multiplayer Sessions** — Students join with a 6-character room code; questions sync in real time via Socket.IO
- **🏆 Live Leaderboard** — Animated rankings with speed bonus and streak multipliers update after every answer
- **👤 Role-based Auth** — Admins create and host quizzes; students join and play
- **🎨 Dark Glassmorphism UI** — Modern dark design with electric violet accent and Framer Motion animations
- **🔐 Dual Authentication** — Google OAuth and email/password authentication with NextAuth.js v5
- **⚡ Real-time Socket.IO** — Custom WebSocket server for live quiz sessions
- **📊 Smart Scoring** — Base points + speed bonus + streak bonus for competitive gameplay
- **🗄️ PostgreSQL Database** — Full Prisma ORM with cascade deletes and relationships
- **🚀 Redis Caching** — Optional Redis backend for leaderboard performance
- **🌐 Responsive Design** — Mobile-friendly interface with theme toggle

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion
- **Fonts**: DM Sans, Space Grotesk, Geist Mono
- **Theme**: next-themes (dark/light mode)
- **Notifications**: Sonner

### Backend
- **Framework**: Next.js 15 API Routes
- **Server**: Custom HTTP + Socket.IO server
- **Language**: TypeScript
- **Runtime**: Node.js 20+

### Database
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Hosting**: Neon (recommended), Railway PostgreSQL

### AI/ML
- **Primary AI**: Groq SDK (Llama 3.3 70B)
- **Fallback AI**: Google Gemini 2.0 Flash / 1.5 Flash Lite / 2.5 Flash
- **API Keys**: GROQ_API_KEY, GEMINI_API_KEY

### Authentication
- **Provider**: Auth.js v5 (NextAuth)
- **Strategies**: Google OAuth, Credentials (email/password)
- **Adapter**: Prisma Adapter
- **Password Hashing**: bcryptjs

### Cloud
- **Deployment**: Railway (recommended), Vercel
- **Database**: Neon PostgreSQL
- **Caching**: Upstash Redis (optional)

### DevOps
- **Package Manager**: npm
- **Process Manager**: tsx
- **Build Tool**: Next.js built-in
- **Linting**: ESLint

### Libraries
- **Validation**: Zod
- **Real-time**: Socket.IO v4
- **Redis**: ioredis
- **Date Utilities**: date-fns
- **Icons**: Lucide React
- **UI Components**: shadcn/ui, Base UI

### APIs
- **Google OAuth**: Google Cloud Console
- **Groq AI**: console.groq.com
- **Google Gemini**: aistudio.google.com

### Deployment
- **Platform**: Railway (recommended for WebSocket support)
- **Alternative**: Vercel (with HTTP long-polling fallback)
- **Config**: railway.json included

---

## 🏗 Architecture

IntelliQuiz uses a hybrid architecture combining Next.js for the web application and a custom Socket.IO server for real-time features:

### Application Flow

1. **Authentication Layer**
   - NextAuth.js v5 handles authentication via Google OAuth or credentials
   - Middleware protects dashboard routes based on user role (ADMIN/STUDENT)
   - Session data stored in PostgreSQL via Prisma adapter

2. **Quiz Creation Flow**
   - Admin creates quiz via dashboard → validates with Zod schemas
   - AI generation request sent to Groq (primary) or Gemini (fallback)
   - Generated questions validated and stored in PostgreSQL
   - Questions linked to quiz with cascade delete relationships

3. **Session Management**
   - Admin starts session → generates unique 6-character room code
   - Socket.IO room created for real-time communication
   - In-memory room manager tracks participants, answers, and state
   - Redis (optional) caches leaderboard data for performance

4. **Live Quiz Execution**
   - Students join via room code → Socket.IO connection established
   - Host controls question flow (Next/Pause/Resume)
   - Questions broadcast with synchronized timers
   - Answers collected and scored with speed/streak bonuses
   - Real-time leaderboard updates after each question

5. **Scoring System**
   - Base points: 1,000 per correct answer
   - Speed bonus: Up to 500 points based on response time
   - Streak bonus: Up to 500 points (100 × streak, max 5)
   - Maximum per question: 1,600 points

### Key Components

- **server.ts**: Custom HTTP server integrating Next.js with Socket.IO
- **server/socket-server.ts**: Real-time event handlers and game logic
- **server/room-manager.ts**: In-memory session state management
- **server/leaderboard-service.ts**: Redis-backed leaderboard with memory fallback
- **lib/gemini.ts**: AI question generation with fallback logic
- **lib/auth.ts**: NextAuth configuration with custom callbacks
- **middleware.ts**: Route protection and role-based access

---

## 📁 Folder Structure

```
IntelliQuiz/
├── server.ts                      # Custom HTTP + Socket.IO entry point
├── middleware.ts                  # Route protection middleware
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
├── railway.json                  # Railway deployment config
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint configuration
├── postcss.config.mjs            # PostCSS configuration
│
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts and providers
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   │
│   ├── (auth)/                  # Authentication route group
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── register/
│   │       └── page.tsx        # Registration page
│   │
│   ├── (dashboard)/             # Admin dashboard route group
│   │   ├── layout.tsx          # Dashboard layout
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard home
│   │       └── quizzes/
│   │           ├── page.tsx    # Quiz list
│   │           ├── new/        # Create quiz
│   │           │   └── page.tsx
│   │           └── [id]/
│   │               ├── page.tsx        # Quiz details
│   │               ├── edit/
│   │               │   └── page.tsx    # Edit quiz
│   │               ├── session/
│   │               │   └── page.tsx    # Host session view
│   │               └── results/
│   │                   └── page.tsx    # Quiz results
│   │
│   ├── (student)/              # Student route group
│   │   ├── join/
│   │   │   └── page.tsx        # Join room by code
│   │   └── quiz/
│   │       └── [sessionId]/
│   │           └── page.tsx    # Student quiz view
│   │
│   ├── actions/                # Server actions
│   │   ├── auth.ts            # Auth server actions
│   │   └── quiz.ts            # Quiz server actions
│   │
│   └── api/                   # API routes
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts   # NextAuth endpoints
│       ├── generate/
│       │   └── route.ts       # AI question generation
│       ├── register/
│       │   └── route.ts       # User registration
│       ├── quizzes/
│       │   ├── route.ts       # Quiz CRUD
│       │   └── [id]/
│       │       ├── route.ts   # Single quiz operations
│       │       └── session/
│       │           └── route.ts # Session creation
│       └── sessions/
│           └── route.ts       # Session lookup by room code
│
├── components/                 # React components
│   ├── auth/                  # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── Providers.tsx
│   ├── dashboard/             # Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── StatsCard.tsx
│   │   └── QuizAnalytics.tsx
│   ├── quiz/                  # Quiz components
│   │   ├── QuizCard.tsx
│   │   ├── QuizForm.tsx
│   │   ├── QuestionEditor.tsx
│   │   ├── ShareRoomCode.tsx
│   │   └── StartSessionButton.tsx
│   ├── session/               # Live session components
│   │   ├── HostSessionView.tsx
│   │   ├── StudentQuizView.tsx
│   │   ├── WaitingRoom.tsx
│   │   ├── QuestionDisplay.tsx
│   │   ├── AnswerOptions.tsx
│   │   ├── Timer.tsx
│   │   └── ResultsView.tsx
│   ├── leaderboard/           # Leaderboard components
│   │   ├── LiveLeaderboard.tsx
│   │   └── LeaderboardRow.tsx
│   ├── landing/               # Landing page components
│   │   └── LandingPage.tsx
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       ├── tabs.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── skeleton.tsx
│       ├── separator.tsx
│       ├── avatar.tsx
│       └── ThemeToggle.tsx
│
├── hooks/                      # Custom React hooks
│   ├── useSocket.ts           # Socket.IO client hook
│   ├── useTimer.ts            # Timer hook
│   └── useLeaderboard.ts      # Leaderboard hook
│
├── lib/                        # Utility libraries
│   ├── auth.ts                # NextAuth configuration
│   ├── auth.config.ts         # Auth.js config
│   ├── prisma.ts              # Prisma client
│   ├── gemini.ts              # AI generation logic
│   ├── redis.ts               # Redis client
│   ├── socket.ts              # Socket.IO client
│   ├── utils.ts               # Utility functions
│   └── validations.ts         # Zod schemas
│
├── server/                     # Server-side logic
│   ├── socket-server.ts       # Socket.IO event handlers
│   ├── room-manager.ts        # Room state management
│   └── leaderboard-service.ts # Leaderboard operations
│
├── prisma/                     # Database schema
│   ├── schema.prisma          # Prisma schema
│   └── migrations/            # Database migrations
│
├── types/                      # TypeScript types
│   ├── index.ts               # Shared types
│   └── next-auth.d.ts         # NextAuth type extensions
│
└── public/                     # Static assets
    └── [screenshots]           # Application screenshots
```

---

## 📦 Prerequisites

- **Node.js**: 20 or higher
- **npm**: 9 or higher (comes with Node.js)
- **PostgreSQL**: 12 or higher (Neon recommended for free tier)
- **Redis**: 6 or higher (Upstash recommended for free tier, optional)
- **Google OAuth Account**: For Google authentication
- **Groq API Key**: From console.groq.com (14,400 req/day free)
- **Google Gemini API Key**: From aistudio.google.com (fallback AI)

---

## 🚀 Installation

### Clone Repository

```bash
git clone <your-repository-url>
cd IntelliQuiz
```

### Install Dependencies

**Windows (PowerShell):**
```powershell
npm install
```

**macOS/Linux:**
```bash
npm install
```

### Configure Environment Variables

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials (see Environment Variables section below).

### Database Setup

**Generate Prisma Client:**
```bash
npm run db:generate
```

**Run Migrations:**
```bash
npm run db:migrate
```

**Alternative: Push Schema (Development Only)**
```bash
npm run db:push
```

### Create Admin Account

1. Register a new account at `/register`
2. Open Prisma Studio to promote the user to admin:

```bash
npm run db:studio
```

3. Navigate to the `User` table
4. Find your registered user
5. Change the `role` field from `STUDENT` to `ADMIN`

### Running Locally

**Development Mode:**
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

> **Note**: `npm run dev` runs `tsx server.ts` (not `next dev`) because Socket.IO needs access to the raw HTTP server.

**Production Mode:**
```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AUTH_SECRET` | Yes | Secret key for NextAuth.js. Generate with `npx auth secret` | `your_auth_secret_here` |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth Client ID from Google Cloud Console | `123456789-abc.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth Client Secret from Google Cloud Console | `GOCSPX-your_secret_here` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:password@host/dbname?sslmode=require` |
| `GROQ_API_KEY` | Yes (primary) | Groq API key for AI generation (14,400 req/day free) | `gsk_your_groq_api_key` |
| `GEMINI_API_KEY` | Yes (fallback) | Google Gemini API key for AI generation fallback | `your_gemini_api_key` |
| `REDIS_URL` | No | Redis connection string for leaderboard caching | `redis://host:port` |
| `NEXTAUTH_URL` | Yes | NextAuth.js URL for your application | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of your application | `http://localhost:3000` |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Socket.IO server URL | `http://localhost:3000` |

### Environment Variable Details

**AUTH_SECRET**
- Required for NextAuth.js session encryption
- Generate using: `npx auth secret`
- Keep this secret and never commit it to version control

**AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET**
- Obtain from [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 credentials (Web application type)
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (local)
- Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google` (production)

**DATABASE_URL**
- PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database?sslmode=require`
- For Neon: Copy connection string from Neon dashboard
- SSL mode is required for most cloud PostgreSQL providers

**GROQ_API_KEY**
- Primary AI provider for question generation
- Obtain from [Groq Console](https://console.groq.com)
- Free tier: 14,400 requests per day
- Fallback to Gemini if quota exceeded

**GEMINI_API_KEY**
- Fallback AI provider for question generation
- Obtain from [Google AI Studio](https://aistudio.google.com)
- Used when Groq quota is exceeded
- Supports multiple models with automatic fallback

**REDIS_URL**
- Optional Redis connection for leaderboard caching
- If not set, leaderboard falls back to in-memory storage
- Recommended for production with many concurrent users
- Format: `redis://host:port` or `rediss://host:port` (SSL)

**NEXTAUTH_URL**
- Internal URL used by NextAuth.js
- Must match your application's URL
- Include protocol (http/https) and port if non-standard

**NEXT_PUBLIC_APP_URL**
- Public URL of your application
- Used for client-side navigation and OAuth redirects
- Must be accessible from users' browsers

**NEXT_PUBLIC_SOCKET_URL**
- Socket.IO server URL for real-time connections
- Usually same as NEXT_PUBLIC_APP_URL
- Must include protocol (http/https) and port if non-standard

---

## 🎮 Running the Project

### Development Mode

**Start the development server:**
```bash
npm run dev
```

The server starts on http://localhost:3000 with:
- Next.js hot reload enabled
- Socket.IO WebSocket server active
- Prisma database connected

### Production Mode

**Build the application:**
```bash
npm run build
```

**Start the production server:**
```bash
npm start
```

This runs the optimized production build with:
- Minified JavaScript and CSS
- Optimized images and assets
- Production-ready Socket.IO server

### Docker

Docker configuration is not currently included in the codebase. You would need to create a Dockerfile and docker-compose.yml manually if you wish to use Docker.

---

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/register
Register a new user account.

**Authentication**: None
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
**Response** (201):
```json
{
  "success": true
}
```

#### GET/POST /api/auth/[...nextauth]
NextAuth.js authentication endpoints.

**Authentication**: None
**Endpoints**:
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/callback/google` - Google OAuth callback
- `/api/auth/session` - Get current session
- `/api/auth/csrf` - CSRF token

### Quiz Endpoints

#### GET /api/quizzes
Get all quizzes for the authenticated admin.

**Authentication**: Required (Admin role)
**Request Body**: None
**Response**:
```json
{
  "quizzes": [
    {
      "id": "quiz_id",
      "title": "Quiz Title",
      "topic": "Topic",
      "difficulty": "MEDIUM",
      "status": "DRAFT",
      "createdAt": "2024-01-01T00:00:00Z",
      "_count": {
        "questions": 10,
        "sessions": 5
      }
    }
  ]
}
```

#### POST /api/quizzes
Create a new quiz with AI-generated questions.

**Authentication**: Required (Admin role)
**Request Body**:
```json
{
  "title": "JavaScript Basics",
  "topic": "JavaScript programming fundamentals",
  "difficulty": "MEDIUM",
  "timePerQuestion": 30,
  "questionCount": 10
}
```
**Response** (201):
```json
{
  "quiz": {
    "id": "quiz_id",
    "title": "JavaScript Basics",
    "topic": "JavaScript programming fundamentals",
    "difficulty": "MEDIUM",
    "timePerQuestion": 30,
    "status": "DRAFT",
    "questions": [
      {
        "id": "question_id",
        "text": "What is JavaScript?",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 0,
        "explanation": "JavaScript is...",
        "order": 0
      }
    ]
  }
}
```

#### GET /api/quizzes/[id]
Get a specific quiz by ID.

**Authentication**: Required
**Request Body**: None
**Response**:
```json
{
  "quiz": {
    "id": "quiz_id",
    "title": "Quiz Title",
    "questions": [...],
    "_count": { "sessions": 5 }
  }
}
```

#### PUT /api/quizzes/[id]
Update a quiz.

**Authentication**: Required (Admin role, owner only)
**Request Body**:
```json
{
  "title": "Updated Title",
  "topic": "Updated topic",
  "difficulty": "HARD",
  "timePerQuestion": 45
}
```
**Response**:
```json
{
  "quiz": {
    "id": "quiz_id",
    "title": "Updated Title",
    ...
  }
}
```

#### DELETE /api/quizzes/[id]
Delete a quiz.

**Authentication**: Required (Admin role, owner only)
**Request Body**: None
**Response**:
```json
{
  "success": true
}
```

### Session Endpoints

#### POST /api/quizzes/[id]/session
Create a new quiz session (start a live quiz).

**Authentication**: Required (Admin role, owner only)
**Request Body**: None
**Response**:
```json
{
  "sessionId": "session_id",
  "roomCode": "ABC123"
}
```

#### GET /api/sessions?roomCode=ABC123
Find a session by room code.

**Authentication**: None
**Request Body**: None
**Response**:
```json
{
  "sessionId": "session_id",
  "quizTitle": "Quiz Title"
}
```

### AI Generation Endpoints

#### POST /api/generate
Generate quiz questions without creating a quiz.

**Authentication**: Required (Admin role)
**Request Body**:
```json
{
  "topic": "React hooks",
  "difficulty": "MEDIUM",
  "count": 5
}
```
**Response**:
```json
{
  "questions": [
    {
      "question": "What is useEffect?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "useEffect is..."
    }
  ]
}
```

---

## 🗄️ Database

### Schema Overview

IntelliQuiz uses PostgreSQL with Prisma ORM. The schema includes:

#### User & Authentication Models

**User**
- `id`: Primary key (CUID)
- `email`: Unique email address
- `name`: Display name
- `password`: Hashed password (optional for OAuth users)
- `role`: ADMIN or STUDENT
- `image`: Profile image URL
- `emailVerified`: Email verification timestamp
- `createdAt`, `updatedAt`: Timestamps

**Account**
- OAuth account linking (Google, etc.)
- Linked to User with cascade delete

**Session**
- User session management
- Linked to User with cascade delete

**VerificationToken**
- Email verification tokens

#### Quiz Models

**Quiz**
- `id`: Primary key (CUID)
- `title`: Quiz title
- `topic`: Quiz topic/description
- `difficulty`: EASY, MEDIUM, or HARD
- `timePerQuestion`: Seconds per question (10-120)
- `status`: DRAFT, ACTIVE, PAUSED, or COMPLETED
- `roomCode`: Unique 6-character room code
- `creatorId`: Foreign key to User
- `createdAt`, `updatedAt`: Timestamps

**Question**
- `id`: Primary key (CUID)
- `quizId`: Foreign key to Quiz (cascade delete)
- `text`: Question text
- `options`: JSON array of 4 options
- `correctIndex`: Index of correct answer (0-3)
- `explanation`: Answer explanation
- `order`: Question order
- `createdAt`: Timestamp

#### Session Models

**QuizSession**
- `id`: Primary key (CUID)
- `quizId`: Foreign key to Quiz (cascade delete)
- `hostId`: Foreign key to User
- `status`: WAITING, ACTIVE, PAUSED, or COMPLETED
- `currentQuestion`: Current question index
- `startedAt`, `endedAt`: Session timestamps
- `createdAt`: Timestamp

**Participant**
- `id`: Primary key (CUID)
- `sessionId`: Foreign key to QuizSession (cascade delete)
- `userId`: Foreign key to User
- `userName`: Display name in session
- `score`: Current score
- `streak`: Current streak count
- `joinedAt`: Join timestamp
- Unique constraint on (sessionId, userId)

**Answer**
- `id`: Primary key (CUID)
- `participantId`: Foreign key to Participant (cascade delete)
- `questionId`: Foreign key to Question (cascade delete)
- `selectedIndex`: Selected option index
- `isCorrect`: Whether answer was correct
- `timeMs`: Time taken in milliseconds
- `pointsEarned`: Points earned for this answer
- `createdAt`: Timestamp
- Unique constraint on (participantId, questionId)

### Relationships

- User → Quiz (one-to-many, as creator)
- User → QuizSession (one-to-many, as host)
- Quiz → Question (one-to-many, cascade delete)
- Quiz → QuizSession (one-to-many, cascade delete)
- QuizSession → Participant (one-to-many, cascade delete)
- Participant → Answer (one-to-many, cascade delete)
- Question → Answer (one-to-many, cascade delete)

### Migrations

Database migrations are managed through Prisma:

**Run migrations:**
```bash
npm run db:migrate
```

**Push schema changes (development):**
```bash
npm run db:push
```

**Open Prisma Studio:**
```bash
npm run db:studio
```

**Regenerate Prisma client:**
```bash
npm run db:generate
```

---

## 🔐 Authentication

### Login/Signup

**Registration**
- Navigate to `/register`
- Enter name, email, and password
- Password must be at least 8 characters
- New users are created with ADMIN role by default
- Password is hashed using bcryptjs

**Login**
- Navigate to `/login`
- Choose Google OAuth or email/password
- Google OAuth: Redirects to Google for authentication
- Email/Password: Validates against database
- Session created via NextAuth.js

### Session Management

- Sessions stored in PostgreSQL via Prisma adapter
- JWT tokens used for client-side session
- Session data includes user ID, email, name, role, and image
- Sessions automatically expire based on configuration

### Role-Based Access

**ADMIN Role**
- Access to `/dashboard` routes
- Can create, edit, and delete quizzes
- Can host live quiz sessions
- Can view quiz analytics and results

**STUDENT Role**
- Can join quiz sessions via room code
- Can participate in live quizzes
- Cannot access dashboard or manage quizzes

### Route Protection

Middleware (`middleware.ts`) protects routes:
- `/dashboard` requires authentication and ADMIN role
- `/login` and `/register` redirect authenticated admins to dashboard
- Unauthenticated users redirected to login for protected routes

---

## ⚙️ Configuration

### Configuration Files

**next.config.ts**
- Configures bcryptjs as external package
- Disables ESLint during builds
- Allows remote images from Google and GitHub
- Optimizes for production deployment

**tsconfig.json**
- TypeScript configuration
- Strict mode enabled
- Path aliases: `@/*` maps to project root
- Target: ES2017
- Module resolution: bundler

**components.json**
- shadcn/ui component configuration
- Tailwind CSS integration
- Component paths and aliases

**railway.json**
- Railway deployment configuration
- Uses Nixpacks builder
- Start command: `npm start`

**eslint.config.mjs**
- ESLint configuration
- Next.js recommended rules
- TypeScript support

**postcss.config.mjs**
- PostCSS configuration
- Tailwind CSS processing

### Auth Configuration

**lib/auth.config.ts**
- NextAuth.js base configuration
- Session strategy (JWT)
- Callback configuration
- Page paths for signin/signout

**lib/auth.ts**
- Complete NextAuth.js setup
- Google OAuth provider
- Credentials provider
- Prisma adapter
- Custom JWT and session callbacks
- User role management

### Database Configuration

**prisma/schema.prisma**
- Database schema definition
- Model relationships
- Enum definitions
- Cascade delete rules

**lib/prisma.ts**
- Prisma client singleton
- Global for development hot reload
- Connection management

---

## 🔨 Build Instructions

### Development Build

```bash
npm run dev
```

This starts the development server with:
- TypeScript compilation on-the-fly
- Hot module replacement
- Socket.IO server active
- Source maps for debugging

### Production Build

```bash
npm run build
```

This creates an optimized production build:
- Minified JavaScript and CSS
- Optimized images
- Tree-shaken dependencies
- Compiled TypeScript
- Prisma client generated

### Build Output

Build artifacts are stored in `.next/` directory:
- Server-side code in `.next/server/`
- Client-side code in `.next/static/`
- Asset optimization and chunking

---

## 🚀 Deployment

### Railway (Recommended)

Railway provides full WebSocket support and is the recommended deployment platform.

**Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Services**
   - Add PostgreSQL plugin
   - Add Redis plugin (optional but recommended)
   - Railway will automatically detect the `railway.json` config

4. **Configure Environment Variables**
   - Set all variables from the Environment Variables section
   - Update `NEXTAUTH_URL` to your Railway domain
   - Update `NEXT_PUBLIC_APP_URL` to your Railway domain
   - Update `NEXT_PUBLIC_SOCKET_URL` to your Railway domain

5. **Update Google OAuth**
   - Go to Google Cloud Console
   - Add Railway domain to authorized redirect URIs:
     `https://your-domain.railway.app/api/auth/callback/google`

6. **Deploy**
   - Railway will automatically deploy on push
   - Monitor deployment logs in Railway dashboard

### Vercel (Alternative)

Vercel deployment requires HTTP long-polling fallback for Socket.IO since serverless functions don't support persistent WebSocket connections.

**Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all variables from the Environment Variables section
   - Use Neon for PostgreSQL: [neon.tech](https://neon.tech)
   - Use Upstash for Redis: [upstash.com](https://upstash.com)

4. **Update Google OAuth**
   - Add Vercel domain to authorized redirect URIs:
     `https://your-domain.vercel.app/api/auth/callback/google`

5. **Deploy**
   - Vercel will automatically deploy on push
   - Socket.IO will use HTTP long-polling as fallback

> **Note**: For full WebSocket support, deploy on Railway, Render, or a VPS instead of Vercel.

### Environment Variables for Production

When deploying, ensure these variables are set correctly:

- `NEXTAUTH_URL`: Full domain with https (e.g., `https://quiz.example.com`)
- `NEXT_PUBLIC_APP_URL`: Full domain with https
- `NEXT_PUBLIC_SOCKET_URL`: Full domain with https
- `DATABASE_URL`: Production PostgreSQL connection string
- `REDIS_URL`: Production Redis connection string (if using)
- `AUTH_SECRET`: Generate a new secret for production

---

## 🧪 Testing

Testing infrastructure is not currently included in the codebase. You would need to set up a testing framework such as Jest or Vitest if you wish to add tests.

### Manual Testing Checklist

**Authentication:**
- [ ] User registration works
- [ ] Email/password login works
- [ ] Google OAuth login works
- [ ] Session persistence works
- [ ] Role-based access control works

**Quiz Creation:**
- [ ] AI question generation works
- [ ] Quiz creation saves to database
- [ ] Quiz editing works
- [ ] Quiz deletion works
- [ ] Question validation works

**Live Sessions:**
- [ ] Room code generation works
- [ ] Students can join via room code
- [ ] Real-time question sync works
- [ ] Answer submission works
- [ ] Scoring algorithm works
- [ ] Leaderboard updates correctly
- [ ] Pause/resume functionality works

**Error Handling:**
- [ ] Invalid room codes handled
- [ ] Network disconnections handled
- [ ] AI quota errors handled
- [ ] Database errors handled

---

## 📜 Scripts

### package.json Scripts

**Development:**
```bash
npm run dev
```
Starts the development server with `tsx server.ts`. This runs both Next.js and Socket.IO on a custom HTTP server.

**Build:**
```bash
npm run build
```
Builds the production application. Runs `prisma generate` and `next build`.

**Production:**
```bash
npm start
```
Starts the production server with `tsx server.ts` in production mode.

**Linting:**
```bash
npm run lint
```
Runs ESLint to check code quality and style.

**Database:**
```bash
npm run db:push
```
Pushes schema changes to the database without creating a migration file. Useful for rapid development.

```bash
npm run db:migrate
```
Creates and applies a new database migration. Use for production schema changes.

```bash
npm run db:studio
```
Opens Prisma Studio, a visual database browser.

```bash
npm run db:generate
```
Regenerates the Prisma client based on the current schema.

---

## 💡 Usage Examples

### Creating a Quiz as Admin

1. **Sign in** as an admin user
2. Navigate to `/dashboard`
3. Click "Create New Quiz"
4. Fill in the form:
   - Title: "JavaScript Fundamentals"
   - Topic: "JavaScript basics, variables, functions"
   - Difficulty: MEDIUM
   - Time per question: 30 seconds
   - Number of questions: 10
5. Click "Generate with AI"
6. Review generated questions
7. Click "Save Quiz"

### Hosting a Live Session

1. Go to your quiz in `/dashboard/quizzes`
2. Click "Start Session"
3. Share the 6-character room code with students
4. Wait for students to join in the waiting room
5. Click "Start Quiz" when ready
6. Control the session:
   - Watch real-time answers
   - View live leaderboard
   - Pause/resume if needed
7. Quiz ends automatically after all questions

### Joining as a Student

1. Sign in (or register) as a student
2. Navigate to `/join`
3. Enter the 6-character room code
4. Wait in the lobby for the host to start
5. Answer each question before the timer expires
6. View your results and explanation after each answer
7. See final leaderboard at the end

### Using AI Generation API

```typescript
// Example API call to generate questions
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'React hooks',
    difficulty: 'MEDIUM',
    count: 5
  })
});

const { questions } = await response.json();
```

---

## 📸 Screenshots

### Landing Page
![Landing Page](public/Screenshot%20from%202026-06-15%2017-15-16.png)
*The main landing page with hero section and call-to-action.*

### Admin Dashboard
![Admin Dashboard](public/Screenshot%20from%202026-06-15%2017-23-15.png)
*Admin dashboard showing quiz list and statistics.*

### Create Quiz with AI
![Create Quiz](public/Screenshot%20from%202026-06-15%2017-24-43.png)
*Quiz creation form with AI-powered question generation.*

### AI-Generated Questions
![Generated Questions](public/Screenshot%20from%202026-06-15%2017-29-06.png)
*Preview of AI-generated questions with explanations.*

### Live Quiz Session
![Live Session](public/Screenshot%20from%202026-06-15%2017-33-42.png)
*Live quiz session with real-time leaderboard.*

---

## ⚠️ Error Handling

### Common Issues and Solutions

**Issue: "AUTH_SECRET not set"**
- **Solution**: Generate a secret with `npx auth secret` and add to `.env.local`

**Issue: "Database connection failed"**
- **Solution**: Verify `DATABASE_URL` is correct and PostgreSQL is accessible
- Check SSL mode is enabled for cloud databases
- Ensure database allows connections from your IP

**Issue: "AI quota exceeded"**
- **Solution**: Wait for quota reset (Groq: daily, Gemini: per-minute)
- Ensure both GROQ_API_KEY and GEMINI_API_KEY are set for fallback
- Check API key validity in respective consoles

**Issue: "Socket.IO connection failed"**
- **Solution**: Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check firewall allows WebSocket connections
- Ensure server is running and Socket.IO is initialized

**Issue: "Room code not found"**
- **Solution**: Verify room code is entered correctly (case-insensitive)
- Check that the session is still active (not completed)
- Ensure host has started the session

**Issue: "Redis connection failed"**
- **Solution**: Leaderboard will fall back to in-memory storage
- Verify `REDIS_URL` is correct if Redis is required
- Check Redis instance is accessible and running

**Issue: "Google OAuth redirect error"**
- **Solution**: Verify redirect URI matches exactly in Google Console
- Include full path: `/api/auth/callback/google`
- Check for http vs https mismatch

**Issue: "Port already in use"**
- **Solution**: Kill process using port 3000 or change PORT environment variable
- On Windows: `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`
- On macOS/Linux: `lsof -ti:3000 | xargs kill -9`

---

## ⚡ Performance Notes

### Database Optimization
- Prisma queries use selective field loading to reduce data transfer
- Cascade deletes ensure clean data without orphaned records
- Indexes on unique fields (email, roomCode) for fast lookups

### Real-time Performance
- Socket.IO uses WebSocket with HTTP long-polling fallback
- In-memory room manager for fast session state access
- Redis caching for leaderboard to reduce database load
- Batch database writes for answer persistence

### AI Generation
- Groq API used as primary (faster response times)
- Gemini fallback with multiple model attempts
- Request validation to prevent unnecessary API calls
- Error handling for quota limits with retry information

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization through Next.js Image component
- Framer Motion animations with hardware acceleration
- Lazy loading for non-critical components

### Caching Strategy
- Redis used for leaderboard caching (optional)
- In-memory fallback when Redis unavailable
- Session state in memory for real-time access
- Database as single source of truth

---

## 🔒 Security Notes

### Authentication Security
- Passwords hashed using bcryptjs with salt rounds of 12
- NextAuth.js session encryption using AUTH_SECRET
- JWT tokens for client-side session management
- CSRF protection enabled by NextAuth.js

### API Security
- Role-based access control on all protected endpoints
- Admin-only endpoints require ADMIN role verification
- Input validation using Zod schemas
- SQL injection prevention through Prisma ORM

### Data Security
- Environment variables for sensitive data (never commit .env.local)
- Database connection strings use SSL mode
- Cascade deletes prevent data leakage
- User data isolation by role and ownership

### WebSocket Security
- CORS configuration for Socket.IO
- Credential validation on socket connection
- Room-based isolation for quiz sessions
- Session validation for all socket events

### OAuth Security
- Google OAuth with state parameter validation
- Secure redirect URI configuration
- Email verification support (optional)
- Account linking for multiple OAuth providers

### Recommended Security Practices
- Use strong AUTH_SECRET (generate with `npx auth secret`)
- Rotate API keys regularly
- Enable database SSL in production
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Regular security audits of dependencies

---

## 🚧 Limitations

- **Concurrent Sessions**: No hard limit, but performance depends on server resources
- **Question Count**: Limited to 3-30 questions per quiz (configurable in validation)
- **Timer Range**: 10-120 seconds per question (configurable in validation)
- **AI Quotas**: Groq (14,400 req/day free), Gemini (rate-limited)
- **WebSocket Support**: Vercel deployment uses HTTP long-polling fallback
- **Redis Optional**: Leaderboard falls back to in-memory without Redis
- **Single Host**: Each quiz session has one host; no co-hosting
- **No Replay**: Completed sessions cannot be replayed
- **No Question Editing**: Questions generated by AI cannot be individually edited (quiz-level editing only)
- **No Media Support**: Questions are text-only; no image/audio/video support
- **No Export**: Quiz results cannot be exported to CSV/PDF

---

## 🔮 Future Improvements

Potential features for future versions:

- **Co-hosting**: Allow multiple hosts per session
- **Question Bank**: Save and reuse questions across quizzes
- **Media Support**: Add images, audio, and video to questions
- **Export Results**: Export quiz results to CSV/PDF
- **Question Types**: Support true/false, short answer, and fill-in-the-blank
- **Team Mode**: Allow players to form teams
- **Custom Themes**: Let hosts customize quiz appearance
- **Analytics Dashboard**: Detailed analytics for host performance
- **Replay Mode**: Allow replaying completed sessions
- **Question Editing**: Edit individual AI-generated questions
- **Tournament Mode**: Multi-round tournaments
- **Achievements**: Unlockable achievements for players
- **Social Features**: Friend system and social sharing
- **Mobile App**: Native mobile applications
- **Offline Mode**: Support for offline quiz taking
- **Advanced AI**: More sophisticated AI for question generation
- **Internationalization**: Multi-language support
- **Accessibility**: Enhanced accessibility features

---

## 🤝 Contributing Guide

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/IntelliQuiz.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style (TypeScript, Prettier if configured)
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Write tests for new features (if testing framework is added)
3. Update the README if you change the API or add features
4. Ensure all scripts pass (`npm run lint`)
5. Submit a Pull Request with a clear description of changes

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🎨 Code Style

### TypeScript
- Strict mode enabled
- Type annotations required for function parameters
- Interfaces for object shapes
- Enums for fixed sets of values

### Naming Conventions
- Components: PascalCase (e.g., `QuizCard.tsx`)
- Functions: camelCase (e.g., `generateQuizQuestions`)
- Constants: UPPER_SNAKE_CASE (e.g., `BASE_POINTS`)
- Files: kebab-case (e.g., `socket-server.ts`)

### Code Organization
- Group related functions together
- Separate concerns (UI, logic, utilities)
- Use barrels (index files) for exports
- Keep functions small and focused

### Comments
- Add comments for complex logic
- Document public API functions
- Explain non-obvious implementations
- Keep comments up-to-date

### ESLint
- Follow Next.js recommended rules
- Fix linting errors before committing
- Use `npm run lint` to check

---

## 📄 License

Not found in the current codebase. You should add a LICENSE file (e.g., MIT, Apache-2.0) to specify the license under which the project is distributed.

---

## 👥 Authors

Not found in the current codebase. You should add author information in the README or a separate AUTHORS.md file.

---

## 🙏 Acknowledgements

- **Next.js** - React framework
- **Prisma** - Database ORM
- **Socket.IO** - Real-time communication
- **Groq** - AI API for question generation
- **Google Gemini** - Fallback AI API
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library
- **NextAuth.js** - Authentication solution
- **Neon** - PostgreSQL hosting
- **Railway** - Deployment platform

---

## 📜 Version History

### Version 0.1.0 (Current)
- Initial release
- AI-powered quiz generation
- Live multiplayer sessions
- Real-time leaderboard
- Role-based authentication
- Dark glassmorphism UI
- Socket.IO integration
- PostgreSQL database
- Redis caching support

---

## ❓ FAQ

**Q: Can I use IntelliQuiz without Redis?**
A: Yes, Redis is optional. The leaderboard will fall back to in-memory storage if Redis is not configured.

**Q: What happens if Groq API quota is exceeded?**
A: The system automatically falls back to Google Gemini API for question generation.

**Q: Can students create quizzes?**
A: No, only users with ADMIN role can create and host quizzes. Students can only join and participate.

**Q: How many players can join a session?**
A: There's no hard limit, but performance depends on server resources and network bandwidth.

**Q: Can I edit questions after they're generated?**
A: Currently, you can edit quiz-level settings (title, topic, difficulty, time), but individual questions cannot be edited after generation.

**Q: Is there a limit to the number of questions per quiz?**
A: Yes, quizzes can have 3-30 questions as configured in the validation schema.

**Q: Can I deploy on Vercel?**
A: Yes, but Socket.IO will use HTTP long-polling fallback since Vercel serverless functions don't support persistent WebSocket connections. For full WebSocket support, deploy on Railway or Render.

**Q: How is the scoring calculated?**
A: Base points (1,000) + speed bonus (up to 500) + streak bonus (up to 500). Maximum per question is 1,600 points.

**Q: Can I export quiz results?**
A: Export functionality is not currently implemented but is planned for future improvements.

**Q: What happens if a student disconnects during a quiz?**
A: The student's progress is saved, but they cannot rejoin the same session. They would need to join a new session.

**Q: Is the application mobile-friendly?**
A: Yes, the UI is responsive and works on mobile devices.

---

## 📞 Contact

Not found in the current codebase. You should add contact information for support or inquiries.

---

## 🌟 Star History

Not applicable. If you publish this repository, consider adding a star history badge from [star-history.com](https://star-history.com).

---

**Generated with [Devin](https://devin.ai)**
