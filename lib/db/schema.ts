import {
  type AnyPgColumn,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const ins = pgTable("ins", {
  id: uuid().primaryKey().defaultRandom(),
  text: text().default("").notNull(),
  moved: boolean().default(false).notNull(),
});

export const projects = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().default("").notNull(),
  description: text().default("").notNull(),
  notes: text().default("").notNull(),
  parentProjectId: uuid().references((): AnyPgColumn => projects.id),
  completed: boolean().default(false).notNull(),
});

export const actions = pgTable("actions", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().default("").notNull(),
  description: text().default("").notNull(),
  notes: text().default("").notNull(),
  deadline: timestamp({ withTimezone: true }),
  projectId: uuid().references(() => projects.id),
  completed: boolean().default(false).notNull(),
});
