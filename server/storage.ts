import { type Session, type InsertSession, type ChordResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSessionResult(id: string, result: ChordResult): Promise<Session | undefined>;
  completeSession(id: string): Promise<Session | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async updateSessionResult(id: string, result: ChordResult): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const results = Array.isArray(session.results) ? session.results : [];
    results.push(result);

    const updatedSession: Session = {
      ...session,
      results,
      currentRound: session.currentRound + 1,
    };

    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async completeSession(id: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession: Session = {
      ...session,
      isCompleted: true,
    };

    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
