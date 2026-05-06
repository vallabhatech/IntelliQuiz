import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createQuizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  topic: z.string().min(5, "Topic must be at least 5 characters").max(500),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  timePerQuestion: z.coerce
    .number()
    .int()
    .min(10, "Minimum 10 seconds")
    .max(120, "Maximum 120 seconds"),
  questionCount: z.coerce
    .number()
    .int()
    .min(3, "Minimum 3 questions")
    .max(30, "Maximum 30 questions"),
});

export const updateQuizSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  topic: z.string().min(5).max(500).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  timePerQuestion: z.coerce.number().int().min(10).max(120).optional(),
});

export const joinRoomSchema = z.object({
  roomCode: z
    .string()
    .length(6, "Room code must be exactly 6 characters")
    .toUpperCase(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
