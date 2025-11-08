import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  userProgress, 
  completedLevels, 
  badges, 
  certificates,
  behavioralMetrics,
  type User, 
  type InsertUser,
  type UserProgress,
  type CompletedLevel,
  type Badge,
  type Certificate
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Progress management
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  updateUserProgress(userId: number, data: Partial<UserProgress>): Promise<UserProgress>;
  createUserProgress(userId: number): Promise<UserProgress>;
  
  // Completed levels
  addCompletedLevel(userId: number, levelId: string, courseId: string, xpEarned: number): Promise<CompletedLevel>;
  getCompletedLevels(userId: number): Promise<CompletedLevel[]>;
  
  // Badges
  addBadge(userId: number, badgeData: Omit<Badge, 'id' | 'userId' | 'earnedAt'>): Promise<Badge>;
  getUserBadges(userId: number): Promise<Badge[]>;
  
  // Certificates
  createCertificate(userId: number, courseId: string, courseName: string, shareableId: string): Promise<Certificate>;
  getCertificate(shareableId: string): Promise<Certificate | undefined>;
  getUserCertificates(userId: number): Promise<Certificate[]>;
  
  // Leaderboard
  getTopUsers(limit: number): Promise<Array<User & { totalXP: number; level: number }>>;
  
  // Behavioral tracking
  trackBehavior(data: {
    userId: number;
    levelId: string;
    activityType: string;
    timeToSolve: number | null;
    hintsUsed: number;
    mistakeCount: number;
    attemptsCount: number;
    successRate: number;
  }): Promise<void>;
  
  getBehavioralMetrics(userId: number, levelId?: string): Promise<any[]>;
}

export class DBStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    const newUser = result[0];
    
    await this.createUserProgress(newUser.id);
    
    return newUser;
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    const result = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
    return result[0];
  }

  async createUserProgress(userId: number): Promise<UserProgress> {
    const result = await db.insert(userProgress).values({
      userId,
      totalXP: 0,
      level: 1,
      currentCourse: null,
      currentLevel: null,
    }).returning();
    return result[0];
  }

  async updateUserProgress(userId: number, data: Partial<UserProgress>): Promise<UserProgress> {
    const result = await db.update(userProgress)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
      .returning();
    return result[0];
  }

  async addCompletedLevel(userId: number, levelId: string, courseId: string, xpEarned: number): Promise<CompletedLevel> {
    const result = await db.insert(completedLevels).values({
      userId,
      levelId,
      courseId,
      xpEarned,
    }).returning();
    return result[0];
  }

  async getCompletedLevels(userId: number): Promise<CompletedLevel[]> {
    return await db.select().from(completedLevels).where(eq(completedLevels.userId, userId));
  }

  async addBadge(userId: number, badgeData: Omit<Badge, 'id' | 'userId' | 'earnedAt'>): Promise<Badge> {
    const result = await db.insert(badges).values({
      userId,
      ...badgeData,
    }).returning();
    return result[0];
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.userId, userId));
  }

  async createCertificate(userId: number, courseId: string, courseName: string, shareableId: string): Promise<Certificate> {
    const result = await db.insert(certificates).values({
      userId,
      courseId,
      courseName,
      shareableId,
    }).returning();
    return result[0];
  }

  async getCertificate(shareableId: string): Promise<Certificate | undefined> {
    const result = await db.select().from(certificates).where(eq(certificates.shareableId, shareableId)).limit(1);
    return result[0];
  }

  async getUserCertificates(userId: number): Promise<Certificate[]> {
    return await db.select().from(certificates).where(eq(certificates.userId, userId));
  }

  async getTopUsers(limit: number = 10): Promise<Array<User & { totalXP: number; level: number }>> {
    const { desc } = await import("drizzle-orm");
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        password: users.password,
        email: users.email,
        createdAt: users.createdAt,
        totalXP: userProgress.totalXP,
        level: userProgress.level,
      })
      .from(users)
      .leftJoin(userProgress, eq(users.id, userProgress.userId))
      .orderBy(desc(userProgress.totalXP))
      .limit(limit);
    
    return result as Array<User & { totalXP: number; level: number }>;
  }

  async trackBehavior(data: {
    userId: number;
    levelId: string;
    activityType: string;
    timeToSolve: number | null;
    hintsUsed: number;
    mistakeCount: number;
    attemptsCount: number;
    successRate: number;
  }): Promise<void> {
    await db.insert(behavioralMetrics).values({
      userId: data.userId,
      levelId: data.levelId,
      activityType: data.activityType,
      timeToSolve: data.timeToSolve,
      hintsUsed: data.hintsUsed,
      mistakeCount: data.mistakeCount,
      attemptsCount: data.attemptsCount,
      successRate: data.successRate,
      performanceScore: calculatePerformanceScore(data),
    });
  }

  async getBehavioralMetrics(userId: number, levelId?: string): Promise<any[]> {
    if (levelId) {
      const { and } = await import("drizzle-orm");
      return await db
        .select()
        .from(behavioralMetrics)
        .where(and(
          eq(behavioralMetrics.userId, userId),
          eq(behavioralMetrics.levelId, levelId)
        ));
    }
    
    return await db
      .select()
      .from(behavioralMetrics)
      .where(eq(behavioralMetrics.userId, userId));
  }
}

function calculatePerformanceScore(data: {
  timeToSolve: number | null;
  hintsUsed: number;
  mistakeCount: number;
  successRate: number;
}): number {
  let score = data.successRate;
  score -= data.hintsUsed * 5;
  score -= data.mistakeCount * 3;
  if (data.timeToSolve && data.timeToSolve < 60) {
    score += 10;
  }
  return Math.max(0, Math.min(100, score));
}

export const storage = new DBStorage();
