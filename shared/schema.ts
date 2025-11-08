import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalXP: integer("total_xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  currentCourse: text("current_course"),
  currentLevel: text("current_level"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const completedLevels = pgTable("completed_levels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  levelId: text("level_id").notNull(),
  courseId: text("course_id").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: text("badge_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  rarity: text("rarity").notNull().default("common"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: text("course_id").notNull(),
  courseName: text("course_name").notNull(),
  shareableId: text("shareable_id").notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  levelId: text("level_id").notNull(),
  courseId: text("course_id").notNull(),
  gameType: text("game_type").notNull(),
  score: integer("score").notNull(),
  timeSpent: integer("time_spent").notNull(),
  success: boolean("success").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

export const behavioralMetrics = pgTable("behavioral_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  levelId: text("level_id").notNull(),
  activityType: text("activity_type").notNull(),
  timeToSolve: integer("time_to_solve"),
  hintsUsed: integer("hints_used").notNull().default(0),
  mistakeCount: integer("mistake_count").notNull().default(0),
  attemptsCount: integer("attempts_count").notNull().default(1),
  successRate: integer("success_rate"),
  performanceScore: integer("performance_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertProgressSchema = createInsertSchema(userProgress);
export const insertCompletedLevelSchema = createInsertSchema(completedLevels);
export const insertBadgeSchema = createInsertSchema(badges);
export const insertCertificateSchema = createInsertSchema(certificates);
export const insertGameSessionSchema = createInsertSchema(gameSessions);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type CompletedLevel = typeof completedLevels.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
