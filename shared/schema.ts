import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  selectedChords: jsonb("selected_chords").notNull(),
  totalRounds: integer("total_rounds").notNull(),
  currentRound: integer("current_round").notNull().default(1),
  results: jsonb("results").notNull().default('[]'),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export interface ChordResult {
  chordName: string;
  color: string;
  isCorrect: boolean;
  roundNumber: number;
}

export interface ChordData {
  name: string;
  japaneseName: string;
  color: string;
  notes: string[];
}
