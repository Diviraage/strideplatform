import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resultsTable = pgTable("results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userName: text("user_name"),
  profile: text("profile").notNull(),
  cogPct: integer("cog_pct").notNull(),
  enPct: integer("en_pct").notNull(),
  adPct: integer("ad_pct").notNull(),
  tagline: text("tagline").notNull(),
  answers: jsonb("answers").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertResultSchema = createInsertSchema(resultsTable).omit({ id: true, createdAt: true });
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof resultsTable.$inferSelect;
