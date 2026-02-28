import { type ChordResult } from "@shared/schema";

export interface ClientSession {
  id: string;
  selectedChords: string[];
  chordSequence: string[];
  totalRounds: number;
  currentRound: number;
  results: ChordResult[];
  chordHistory: string[];
  isCompleted: boolean;
  createdAt: string;
}

const sessions = new Map<string, ClientSession>();

export function createSession(data: {
  selectedChords: string[];
  chordSequence: string[];
  totalRounds: number;
}): ClientSession {
  const id = crypto.randomUUID();
  const session: ClientSession = {
    id,
    selectedChords: data.selectedChords,
    chordSequence: data.chordSequence,
    totalRounds: data.totalRounds,
    currentRound: 1,
    results: [],
    chordHistory: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): ClientSession | undefined {
  return sessions.get(id);
}

export function updateSessionResult(
  id: string,
  result: ChordResult,
): ClientSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  session.results.push(result);
  session.chordHistory.push(result.chordName);
  session.currentRound = Math.min(
    session.currentRound + 1,
    session.totalRounds + 1,
  );

  return session;
}

export function completeSession(id: string): ClientSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  session.isCompleted = true;
  return session;
}
