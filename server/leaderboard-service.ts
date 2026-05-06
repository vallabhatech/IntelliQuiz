import { getRedis } from "../lib/redis";
import { roomManager } from "./room-manager";
import type { LeaderboardEntry } from "../types";

const ZSET_KEY = (sessionId: string) => `leaderboard:${sessionId}`;
const META_KEY = (sessionId: string) => `leaderboard:${sessionId}:meta`;

interface ParticipantMeta {
  name: string;
  streak: number;
  correctCount: number;
  image?: string | null;
}

export async function initLeaderboard(
  sessionId: string,
  participants: Array<{ userId: string; name: string; score: number; streak: number; correctCount: number }>
): Promise<void> {
  const redis = getRedis();
  if (!redis || participants.length === 0) return;

  const zsetArgs: (string | number)[] = [];
  const metaArgs: string[] = [];
  for (const p of participants) {
    zsetArgs.push(p.score, p.userId);
    metaArgs.push(p.userId, JSON.stringify({ name: p.name, streak: p.streak, correctCount: p.correctCount }));
  }

  await Promise.all([
    redis.zadd(ZSET_KEY(sessionId), ...zsetArgs),
    redis.hset(META_KEY(sessionId), ...metaArgs),
  ]);
}

export async function updateScore(
  sessionId: string,
  userId: string,
  score: number,
  meta: ParticipantMeta
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  await Promise.all([
    redis.zadd(ZSET_KEY(sessionId), score, userId),
    redis.hset(META_KEY(sessionId), userId, JSON.stringify(meta)),
  ]);
}

export async function getLeaderboard(sessionId: string, n = 50): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  if (!redis) return getLeaderboardFromMemory(sessionId, n);

  const members = await redis.zrevrange(ZSET_KEY(sessionId), 0, n - 1, "WITHSCORES");
  if (!members.length) return getLeaderboardFromMemory(sessionId, n);

  const userIds: string[] = [];
  const scores: number[] = [];
  for (let i = 0; i < members.length; i += 2) {
    userIds.push(members[i]);
    scores.push(parseFloat(members[i + 1]));
  }

  const metaRaw = await redis.hmget(META_KEY(sessionId), ...userIds);

  return userIds.map((userId, i) => {
    let meta: ParticipantMeta = { name: userId, streak: 0, correctCount: 0 };
    try {
      if (metaRaw[i]) meta = JSON.parse(metaRaw[i]!);
    } catch {}
    return {
      rank: i + 1,
      userId,
      name: meta.name,
      image: meta.image ?? null,
      score: scores[i],
      streak: meta.streak,
      correctCount: meta.correctCount,
    };
  });
}

export function getLeaderboardFromMemory(sessionId: string, n = 50): LeaderboardEntry[] {
  const room = roomManager.getRoom(sessionId);
  if (!room) return [];

  const sorted = [...room.participants.values()].sort((a, b) => b.score - a.score);
  return sorted.slice(0, n).map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    name: p.name,
    image: null,
    score: p.score,
    streak: p.streak,
    correctCount: p.correctCount,
  }));
}

export async function deleteLeaderboard(sessionId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(ZSET_KEY(sessionId), META_KEY(sessionId));
}
