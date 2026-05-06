import type { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { roomManager } from "./room-manager";
import type { RoomState } from "./room-manager";
import * as leaderboardService from "./leaderboard-service";
import type { LeaderboardEntry, AnswerResultPayload } from "../types";

const BASE_POINTS = 1000;
const SPEED_BONUS_MAX = 500;
const STREAK_BONUS_PER = 100;
const MAX_STREAK_BONUS = 5;
const BREAK_SECONDS = 5;

const questionTimeouts = new Map<string, NodeJS.Timeout>();
const breakTimeouts = new Map<string, NodeJS.Timeout>();

function calculateScore(
  isCorrect: boolean,
  timeMs: number,
  timeLimitSeconds: number,
  currentStreak: number
): { points: number; newStreak: number; speedBonus: number; streakBonus: number } {
  if (!isCorrect) {
    return { points: 0, newStreak: 0, speedBonus: 0, streakBonus: 0 };
  }

  const timeLimitMs = timeLimitSeconds * 1000;
  const clampedTimeMs = Math.min(timeMs, timeLimitMs);
  const speedRatio = (timeLimitMs - clampedTimeMs) / timeLimitMs;
  const speedBonus = Math.round(speedRatio * SPEED_BONUS_MAX);
  const newStreak = currentStreak + 1;
  const streakBonus = Math.min(newStreak, MAX_STREAK_BONUS) * STREAK_BONUS_PER;
  const points = BASE_POINTS + speedBonus + streakBonus;

  return { points, newStreak, speedBonus, streakBonus };
}

function clearQuestionTimeout(sessionId: string) {
  const t = questionTimeouts.get(sessionId);
  if (t) { clearTimeout(t); questionTimeouts.delete(sessionId); }
}

function scheduleQuestionEnd(io: Server, sessionId: string, delayMs: number) {
  clearQuestionTimeout(sessionId);
  const t = setTimeout(() => { void evaluateQuestion(io, sessionId); }, delayMs);
  questionTimeouts.set(sessionId, t);
}

async function evaluateQuestion(io: Server, sessionId: string): Promise<void> {
  clearQuestionTimeout(sessionId);

  const room = roomManager.getRoom(sessionId);
  if (!room || room.status !== "active") return;

  room.status = "break"; // guard against double-invocation

  const question = room.questions[room.questionIndex];
  const isLastQuestion = room.questionIndex + 1 >= room.totalQuestions;

  const personalResults = new Map<string, AnswerResultPayload>();

  for (const [userId, answer] of room.currentAnswers) {
    const participant = room.participants.get(userId);
    if (!participant) continue;

    const isCorrect = answer.selectedIndex === question.correctIndex;
    const { points, newStreak } = calculateScore(
      isCorrect, answer.timeMs, room.timePerQuestion, participant.streak
    );

    if (isCorrect) {
      participant.score += points;
      participant.streak = newStreak;
      participant.correctCount += 1;
    } else {
      participant.streak = 0;
    }

    personalResults.set(userId, {
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      points,
      streak: participant.streak,
      totalScore: participant.score,
    });
  }

  // Reset streak for participants who did not answer
  for (const [userId, participant] of room.participants) {
    if (!room.currentAnswers.has(userId)) {
      participant.streak = 0;
    }
  }

  // Persist answers to DB (fire-and-forget — non-fatal)
  void persistAnswersBatch(sessionId, room, personalResults);

  // Update Redis leaderboard (fire-and-forget per participant)
  for (const participant of room.participants.values()) {
    void leaderboardService.updateScore(sessionId, participant.userId, participant.score, {
      name: participant.name,
      streak: participant.streak,
      correctCount: participant.correctCount,
    });
  }

  // Build leaderboard (awaited — need it for the broadcast)
  const leaderboard = await leaderboardService.getLeaderboard(sessionId);

  // Emit personal answer-result to each socket (including non-answerers)
  for (const participant of room.participants.values()) {
    if (!participant.socketId) continue;
    const result = personalResults.get(participant.userId) ?? {
      isCorrect: false,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      points: 0,
      streak: 0,
      totalScore: participant.score,
    };
    io.to(participant.socketId).emit("answer-result", result);
  }

  // Broadcast unified question-result to room
  io.to(room.roomCode).emit("question-result", {
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    leaderboard,
    breakSeconds: isLastQuestion ? 0 : BREAK_SECONDS,
  });

  roomManager.resetAnswers(sessionId);

  if (isLastQuestion) {
    await endQuiz(io, sessionId);
  } else {
    const t = setTimeout(() => { void advanceToNextQuestion(io, sessionId); }, BREAK_SECONDS * 1000);
    breakTimeouts.set(sessionId, t);
  }
}

async function persistAnswersBatch(
  sessionId: string,
  room: RoomState,
  personalResults: Map<string, AnswerResultPayload>
): Promise<void> {
  try {
    const question = room.questions[room.questionIndex];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writes: any[] = [];

    for (const [userId, answer] of room.currentAnswers) {
      const participant = room.participants.get(userId);
      const result = personalResults.get(userId);
      if (!participant?.dbId || !result) continue;

      writes.push(
        prisma.answer.upsert({
          where: { participantId_questionId: { participantId: participant.dbId, questionId: question.id } },
          create: {
            participantId: participant.dbId,
            questionId: question.id,
            selectedIndex: answer.selectedIndex,
            isCorrect: result.isCorrect,
            timeMs: answer.timeMs,
            pointsEarned: result.points,
          },
          update: {},
        })
      );
      writes.push(
        prisma.participant.update({
          where: { id: participant.dbId },
          data: { score: participant.score, streak: participant.streak },
        })
      );
    }

    if (writes.length > 0) {
      await prisma.$transaction(writes);
    }
  } catch (err) {
    console.error("[persistAnswersBatch] error:", err);
  }
}

async function advanceToNextQuestion(io: Server, sessionId: string): Promise<void> {
  const room = roomManager.getRoom(sessionId);
  if (!room) return;

  const nextIndex = room.questionIndex + 1;
  if (nextIndex >= room.totalQuestions) {
    await endQuiz(io, sessionId);
    return;
  }

  const question = room.questions[nextIndex];
  const questionStartTime = Date.now();
  const questionEndTime = questionStartTime + room.timePerQuestion * 1000;

  roomManager.setQuestionActive(sessionId, nextIndex, questionEndTime);

  void prisma.quizSession.update({
    where: { id: sessionId },
    data: { currentQuestion: nextIndex },
  }).catch((err) => console.error("[advanceToNextQuestion] DB error:", err));

  const payload = {
    question: {
      id: question.id,
      quizId: question.quizId,
      text: question.text,
      options: question.options,
      order: question.order,
    },
    questionNumber: nextIndex + 1,
    totalQuestions: room.totalQuestions,
    timeLimit: room.timePerQuestion,
    questionStartTime,
    questionEndTime,
  };

  await broadcastToRoom(io, room.roomCode, "question-start", payload);
  scheduleQuestionEnd(io, sessionId, room.timePerQuestion * 1000);
}

async function endQuiz(io: Server, sessionId: string): Promise<void> {
  const room = roomManager.getRoom(sessionId);
  if (!room) return;

  room.status = "completed";

  const leaderboard = await leaderboardService.getLeaderboard(sessionId);
  const quizId = room.questions[0]?.quizId;

  try {
    await prisma.$transaction([
      prisma.quizSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED", endedAt: new Date() },
      }),
      ...(quizId
        ? [prisma.quiz.update({ where: { id: quizId }, data: { status: "COMPLETED" } })]
        : []),
    ]);
  } catch (err) {
    console.error("[endQuiz] DB error:", err);
  }

  io.to(room.roomCode).emit("quiz-ended", { leaderboard });

  void leaderboardService.deleteLeaderboard(sessionId);
  roomManager.deleteRoom(sessionId);
}

// Emit to every connected socket in the Socket.IO room individually.
// Using fetchSockets() + per-socket emit is more reliable than io.to(room).emit()
// because it explicitly enumerates each connected socket rather than relying on
// the internal room-adapter lookup, which can be stale in edge cases.
async function broadcastToRoom(io: Server, roomCode: string, event: string, payload: unknown): Promise<void> {
  try {
    const sockets = await io.in(roomCode).fetchSockets();
    console.log(`[broadcastToRoom] event=${event} room=${roomCode} sockets=${sockets.length}`);
    for (const s of sockets) {
      s.emit(event, payload);
    }
    // Fall back to room broadcast in case fetchSockets missed any sockets
    if (sockets.length === 0) {
      io.to(roomCode).emit(event, payload);
    }
  } catch (err) {
    console.error(`[broadcastToRoom] error for room ${roomCode}:`, err);
    // Fallback: standard room broadcast
    io.to(roomCode).emit(event, payload);
  }
}

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    // Host-specific join: does NOT create a participant record.
    // The host needs to be in the Socket.IO room to receive events but must
    // not be counted as a quiz participant.
    socket.on(
      "host-join-room",
      async ({ roomCode, sessionId }: { roomCode: string; sessionId: string }) => {
        try {
          socket.data.sessionId = sessionId;
          socket.data.roomCode = roomCode;
          socket.data.isHost = true;
          await socket.join(roomCode);

          // Track the host socket ID in the room (create room if needed)
          let room = roomManager.getRoom(sessionId);
          if (!room) {
            const quiz = await prisma.quiz.findUnique({
              where: { roomCode },
              select: { timePerQuestion: true },
            });
            room = roomManager.createRoom(sessionId, roomCode);
            if (quiz) room.timePerQuestion = quiz.timePerQuestion;
          }
          room.hostSocketId = socket.id;

          const participantCount = await prisma.participant.count({
            where: { sessionId },
          });

          socket.emit("room-joined", {
            sessionId,
            participantCount,
          });

          console.log(`[host-join-room] sessionId=${sessionId} roomCode=${roomCode} socketId=${socket.id} participants=${participantCount}`);
        } catch (err) {
          console.error("[host-join-room] error:", err);
          socket.emit("error", { message: "Failed to join room as host" });
        }
      }
    );

    socket.on(
      "join-room",
      async ({ roomCode, userId, userName }: { roomCode: string; userId: string; userName: string }) => {
        try {
          const quiz = await prisma.quiz.findUnique({
            where: { roomCode },
            include: {
              sessions: {
                where: { status: { in: ["WAITING", "ACTIVE", "PAUSED"] } },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          });

          if (!quiz || !quiz.sessions.length) {
            socket.emit("error", { message: "Room not found or session ended" });
            return;
          }

          const session = quiz.sessions[0];
          socket.data.userId = userId;
          socket.data.sessionId = session.id;
          socket.data.roomCode = roomCode;
          await socket.join(roomCode);

          const participant = await prisma.participant.upsert({
            where: { sessionId_userId: { sessionId: session.id, userId } },
            create: { sessionId: session.id, userId, userName: userName || "Anonymous" },
            update: { userName: userName || "Anonymous" },
          });

          const participantCount = await prisma.participant.count({
            where: { sessionId: session.id },
          });

          // Create or update in-memory room state
          let room = roomManager.getRoom(session.id);
          if (!room) {
            room = roomManager.createRoom(session.id, roomCode);
            room.timePerQuestion = quiz.timePerQuestion;
          }
          roomManager.addParticipant(session.id, {
            userId,
            name: userName || "Anonymous",
            socketId: socket.id,
            score: participant.score,
            streak: participant.streak,
            correctCount: 0,
            dbId: participant.id,
          });

          // Build current question payload for mid-session joins
          let currentQuestion: object | undefined;
          if (session.status === "ACTIVE" || session.status === "PAUSED") {
            const q = room.questions[room.questionIndex];
            if (q) {
              const alreadyAnswered = room.currentAnswers.has(userId);
              currentQuestion = {
                question: {
                  id: q.id,
                  quizId: q.quizId,
                  text: q.text,
                  options: q.options,
                  order: q.order,
                },
                questionNumber: room.questionIndex + 1,
                totalQuestions: room.totalQuestions,
                timeLimit: room.timePerQuestion,
                questionStartTime: room.questionEndTime - room.timePerQuestion * 1000,
                questionEndTime: room.questionEndTime,
                alreadyAnswered,
              };
            }
          }

          console.log(`[join-room] userId=${userId} roomCode=${roomCode} socketId=${socket.id} sessionId=${session.id} count=${participantCount}`);

          socket.emit("room-joined", {
            sessionId: session.id,
            quizTitle: quiz.title,
            participantCount,
            status: session.status,
            currentQuestion,
          });

          // Notify the whole room (including host) about the new participant count
          io.to(roomCode).emit("participant-joined", { participantCount });

          // Belt-and-suspenders: also emit directly to host socket if tracked
          if (room.hostSocketId) {
            io.to(room.hostSocketId).emit("participant-joined", { participantCount });
          }
        } catch (err) {
          console.error("[join-room] error:", err);
          socket.emit("error", { message: "Failed to join room" });
        }
      }
    );

    socket.on(
      "submit-answer",
      ({
        questionId,
        selectedIndex,
        timeMs,
      }: {
        questionId: string;
        selectedIndex: number;
        timeMs: number;
      }) => {
        const userId = socket.data.userId as string | undefined;
        const sessionId = socket.data.sessionId as string | undefined;

        if (!userId || !sessionId) {
          socket.emit("error", { message: "Not in a session" });
          return;
        }

        const room = roomManager.getRoom(sessionId);
        if (!room || room.status !== "active") {
          socket.emit("error", { message: "No active question" });
          return;
        }

        const currentQuestion = room.questions[room.questionIndex];
        if (!currentQuestion || currentQuestion.id !== questionId) {
          socket.emit("error", { message: "Question mismatch" });
          return;
        }

        if (room.currentAnswers.has(userId)) {
          socket.emit("error", { message: "Already answered this question" });
          return;
        }

        roomManager.recordAnswer(sessionId, userId, { selectedIndex, timeMs });
        socket.emit("answer-submitted", { questionId });
        // Evaluation always happens when the question timer expires — never early.
      }
    );

    socket.on(
      "host-next-question",
      ({ sessionId }: { sessionId: string }) => {
        const t = breakTimeouts.get(sessionId);
        if (t) { clearTimeout(t); breakTimeouts.delete(sessionId); }
        void advanceToNextQuestion(io, sessionId);
      }
    );

    socket.on(
      "host-start-session",
      async ({ sessionId }: { sessionId: string }) => {
        try {
          const session = await prisma.quizSession.findUnique({
            where: { id: sessionId },
            include: {
              quiz: { include: { questions: { orderBy: { order: "asc" } } } },
              participants: true,
            },
          });

          if (!session || !session.quiz.questions.length) return;

          // Only block if a question timer is actively running
          if (questionTimeouts.has(sessionId)) return;

          const roomCode = session.quiz.roomCode!;

          // Preserve socket IDs from the existing in-memory room
          const savedSocketIds = new Map<string, string>();
          const existingRoom = roomManager.getRoom(sessionId);
          const previousHostSocketId = existingRoom?.hostSocketId ?? "";
          if (existingRoom) {
            for (const [uid, p] of existingRoom.participants) {
              if (p.socketId) savedSocketIds.set(uid, p.socketId);
            }
            roomManager.deleteRoom(sessionId);
          }

          // Fresh room
          const room = roomManager.createRoom(sessionId, roomCode);
          room.timePerQuestion = session.quiz.timePerQuestion;
          room.hostSocketId = previousHostSocketId || socket.id;

          roomManager.loadQuestions(
            sessionId,
            session.quiz.questions.map((q) => ({
              id: q.id,
              quizId: q.quizId,
              text: q.text,
              options: q.options as string[],
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              order: q.order,
            }))
          );

          // Load DB participants (excluding host), restoring socket IDs
          for (const p of session.participants) {
            if (p.userId === session.hostId) continue; // host is not a quiz participant
            room.participants.set(p.userId, {
              userId: p.userId,
              name: p.userName,
              socketId: savedSocketIds.get(p.userId) ?? "",
              score: p.score,
              streak: p.streak,
              correctCount: 0,
              dbId: p.id,
            });
          }

          await leaderboardService.initLeaderboard(sessionId, [...room.participants.values()]);

          await prisma.quizSession.update({
            where: { id: sessionId },
            data: { status: "ACTIVE", startedAt: new Date(), currentQuestion: 0 },
          });

          const q = session.quiz.questions[0];
          const questionStartTime = Date.now();
          const questionEndTime = questionStartTime + session.quiz.timePerQuestion * 1000;

          roomManager.setQuestionActive(sessionId, 0, questionEndTime);

          const questionStartPayload = {
            question: {
              id: q.id,
              quizId: q.quizId,
              text: q.text,
              options: q.options as string[],
              order: q.order,
            },
            questionNumber: 1,
            totalQuestions: session.quiz.questions.length,
            timeLimit: session.quiz.timePerQuestion,
            questionStartTime,
            questionEndTime,
          };

          console.log(
            `[host-start-session] roomCode=${roomCode} participants=${room.participants.size} ` +
            `hostSocket=${room.hostSocketId} ` +
            `socketIds=[${[...room.participants.values()].map(p => p.socketId || "(none)").join(", ")}]`
          );

          // Use broadcastToRoom for reliable delivery to all connected sockets
          await broadcastToRoom(io, roomCode, "question-start", questionStartPayload);

          scheduleQuestionEnd(io, sessionId, session.quiz.timePerQuestion * 1000);
        } catch (err) {
          console.error("[host-start-session] error:", err);
        }
      }
    );

    socket.on("host-pause", ({ sessionId }: { sessionId: string }) => {
      const room = roomManager.getRoom(sessionId);
      if (!room) return;

      clearQuestionTimeout(sessionId);
      roomManager.pause(sessionId);

      void prisma.quizSession.update({
        where: { id: sessionId },
        data: { status: "PAUSED" },
      }).catch((err) => console.error("[host-pause] DB error:", err));

      io.to(room.roomCode).emit("quiz-paused");
    });

    socket.on("host-resume", ({ sessionId }: { sessionId: string }) => {
      const room = roomManager.getRoom(sessionId);
      if (!room || room.pausedRemainingMs === null) return;

      roomManager.resume(sessionId);

      const question = room.questions[room.questionIndex];
      const remainingMs = room.questionEndTime - Date.now();

      void prisma.quizSession.update({
        where: { id: sessionId },
        data: { status: "ACTIVE" },
      }).catch((err) => console.error("[host-resume] DB error:", err));

      io.to(room.roomCode).emit("quiz-resumed");
      io.to(room.roomCode).emit("question-start", {
        question: {
          id: question.id,
          quizId: question.quizId,
          text: question.text,
          options: question.options,
          order: question.order,
        },
        questionNumber: room.questionIndex + 1,
        totalQuestions: room.totalQuestions,
        timeLimit: room.timePerQuestion,
        questionStartTime: room.questionEndTime - room.timePerQuestion * 1000,
        questionEndTime: room.questionEndTime,
      });

      scheduleQuestionEnd(io, sessionId, remainingMs);
    });

    socket.on("disconnect", () => {
      const { userId, sessionId, isHost } = socket.data as { userId?: string; sessionId?: string; isHost?: boolean };
      if (sessionId) {
        const room = roomManager.getRoom(sessionId);
        if (room) {
          if (isHost && room.hostSocketId === socket.id) {
            room.hostSocketId = "";
          } else if (userId) {
            const p = room.participants.get(userId);
            if (p) p.socketId = "";
          }
        }
      }
    });
  });
}
