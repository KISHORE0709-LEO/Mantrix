import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateHint, generateChallenge, provideExplanation, getMotivationalMessage } from "./ai";
import { getRecommendedVideos } from "./services/youtube";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import "./types";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
      });

      req.session.userId = user.id;
      req.session.username = user.username;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Account created successfully!" });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Logged in successfully!" });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // User Progress Routes
  app.get("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const progress = await storage.getUserProgress(userId);
      const completedLevels = await storage.getCompletedLevels(userId);
      const badges = await storage.getUserBadges(userId);

      res.json({ progress, completedLevels, badges });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress/update", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { totalXP, level, currentCourse, currentLevel } = req.body;
      const progress = await storage.updateUserProgress(userId, {
        totalXP,
        level,
        currentCourse,
        currentLevel,
      });
      res.json({ progress });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.post("/api/progress/complete-level", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { levelId, courseId, xpEarned } = req.body;
      const completedLevel = await storage.addCompletedLevel(userId, levelId, courseId, xpEarned);
      res.json({ success: true, completedLevel });
    } catch (error) {
      console.error("Error completing level:", error);
      res.status(500).json({ error: "Failed to complete level" });
    }
  });

  // Badge Routes
  app.post("/api/badges/earn", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { badgeId, name, description, icon, rarity } = req.body;
      const badge = await storage.addBadge(userId, { badgeId, name, description, icon, rarity });
      res.json({ badge });
    } catch (error) {
      console.error("Error earning badge:", error);
      res.status(500).json({ error: "Failed to earn badge" });
    }
  });

  // Certificate Routes
  app.post("/api/certificates/create", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { courseId, courseName } = req.body;
      const shareableId = nanoid(10);
      const certificate = await storage.createCertificate(userId, courseId, courseName, shareableId);
      res.json({ certificate });
    } catch (error) {
      console.error("Error creating certificate:", error);
      res.status(500).json({ error: "Failed to create certificate" });
    }
  });

  app.get("/api/certificates/:shareableId", async (req, res) => {
    try {
      const { shareableId } = req.params;
      const certificate = await storage.getCertificate(shareableId);
      
      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      const user = await storage.getUser(certificate.userId);
      res.json({ certificate, username: user?.username });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ error: "Failed to fetch certificate" });
    }
  });

  app.get("/api/certificates", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const certificates = await storage.getUserCertificates(userId);
      res.json({ certificates });
    } catch (error) {
      console.error("Error fetching user certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Leaderboard Routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topUsers = await storage.getTopUsers(limit);
      
      const leaderboard = topUsers.map((user) => ({
        username: user.username,
        totalXP: user.totalXP || 0,
        level: user.level || 1,
      }));

      res.json({ leaderboard });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // AI Learning Companion Routes
  app.post("/api/ai/hint", async (req, res) => {
    try {
      const { levelId, courseId, userProgress, difficulty } = req.body;
      const hint = await generateHint({ levelId, courseId, userProgress, difficulty });
      res.json({ hint });
    } catch (error) {
      console.error("Error generating hint:", error);
      res.status(500).json({ error: "Failed to generate hint" });
    }
  });

  app.post("/api/ai/challenge", async (req, res) => {
    try {
      const { topic, difficulty, challengeType } = req.body;
      const challenge = await generateChallenge({ topic, difficulty, challengeType });
      res.json(challenge);
    } catch (error) {
      console.error("Error generating challenge:", error);
      res.status(500).json({ error: "Failed to generate challenge" });
    }
  });

  app.post("/api/ai/explanation", async (req, res) => {
    try {
      const { topic, userAnswer, correctAnswer } = req.body;
      const explanation = await provideExplanation(topic, userAnswer, correctAnswer);
      res.json({ explanation });
    } catch (error) {
      console.error("Error generating explanation:", error);
      res.status(500).json({ error: "Failed to generate explanation" });
    }
  });

  app.post("/api/ai/motivation", async (req, res) => {
    try {
      const { completedLevels, totalXP } = req.body;
      const message = await getMotivationalMessage(completedLevels, totalXP);
      res.json({ message });
    } catch (error) {
      console.error("Error generating motivational message:", error);
      res.status(500).json({ error: "Failed to generate message" });
    }
  });

  app.post("/api/youtube/recommendations", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }
      
      const videos = await getRecommendedVideos(topic, difficulty || 'beginner');
      res.json({ videos });
    } catch (error) {
      console.error('Error fetching video recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
