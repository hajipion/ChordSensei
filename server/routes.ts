import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, type ChordResult } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new training session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Get session by ID
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  // Update session with answer result
  app.post("/api/sessions/:id/answer", async (req, res) => {
    try {
      const resultSchema = z.object({
        chordName: z.string(),
        color: z.string(),
        isCorrect: z.boolean(),
        roundNumber: z.number(),
      });
      
      const result = resultSchema.parse(req.body);
      const session = await storage.updateSessionResult(req.params.id, result);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid result data" });
    }
  });

  // Complete session
  app.post("/api/sessions/:id/complete", async (req, res) => {
    try {
      const session = await storage.completeSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
