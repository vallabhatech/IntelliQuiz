export interface StoredQuestion {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  order: number;
}

export interface ParticipantState {
  userId: string;
  name: string;
  socketId: string;
  score: number;
  streak: number;
  correctCount: number;
  dbId: string;
}

export interface PendingAnswer {
  selectedIndex: number;
  timeMs: number;
}

export interface RoomState {
  sessionId: string;
  roomCode: string;
  questions: StoredQuestion[];
  questionIndex: number;
  questionEndTime: number;
  timePerQuestion: number;
  totalQuestions: number;
  participants: Map<string, ParticipantState>;
  currentAnswers: Map<string, PendingAnswer>;
  status: "waiting" | "active" | "break" | "completed";
  pausedRemainingMs: number | null;
  hostSocketId: string;
}

class RoomManager {
  private rooms = new Map<string, RoomState>();

  createRoom(sessionId: string, roomCode: string): RoomState {
    const room: RoomState = {
      sessionId,
      roomCode,
      questions: [],
      questionIndex: 0,
      questionEndTime: 0,
      timePerQuestion: 0,
      totalQuestions: 0,
      participants: new Map(),
      currentAnswers: new Map(),
      status: "waiting",
      pausedRemainingMs: null,
      hostSocketId: "",
    };
    this.rooms.set(sessionId, room);
    return room;
  }

  getRoom(sessionId: string): RoomState | undefined {
    return this.rooms.get(sessionId);
  }

  deleteRoom(sessionId: string): void {
    this.rooms.delete(sessionId);
  }

  loadQuestions(sessionId: string, questions: StoredQuestion[]): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    room.questions = questions;
    room.totalQuestions = questions.length;
  }

  addParticipant(sessionId: string, p: ParticipantState): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    const existing = room.participants.get(p.userId);
    if (existing) {
      existing.socketId = p.socketId;
      existing.name = p.name;
    } else {
      room.participants.set(p.userId, p);
    }
  }

  updateSocketId(sessionId: string, userId: string, socketId: string): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    const p = room.participants.get(userId);
    if (p) p.socketId = socketId;
  }

  recordAnswer(sessionId: string, userId: string, answer: PendingAnswer): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    if (room.currentAnswers.has(userId)) return;
    room.currentAnswers.set(userId, answer);
  }

  resetAnswers(sessionId: string): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    room.currentAnswers = new Map();
  }

  setQuestionActive(sessionId: string, index: number, endTime: number): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    room.questionIndex = index;
    room.questionEndTime = endTime;
    room.status = "active";
    room.pausedRemainingMs = null;
  }

  pause(sessionId: string): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    room.pausedRemainingMs = Math.max(0, room.questionEndTime - Date.now());
    room.status = "waiting";
  }

  resume(sessionId: string): void {
    const room = this.rooms.get(sessionId);
    if (!room || room.pausedRemainingMs === null) return;
    room.questionEndTime = Date.now() + room.pausedRemainingMs;
    room.status = "active";
    room.pausedRemainingMs = null;
  }
}

export const roomManager = new RoomManager();
