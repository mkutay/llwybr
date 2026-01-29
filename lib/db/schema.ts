import {
  type AnyPgColumn,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().default("").notNull(),
  description: text().default("").notNull(),
  notes: text().default("").notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  parentProjectId: uuid().references((): AnyPgColumn => projects.id),
  completed: timestamp({ withTimezone: true }),
  archived: timestamp({ withTimezone: true }),
});

export const actions = pgTable("actions", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().default("").notNull(),
  description: text().default("").notNull(),
  notes: text().default("").notNull(),
  deadline: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  projectId: uuid().references(() => projects.id),
  completed: timestamp({ withTimezone: true }),
  archived: timestamp({ withTimezone: true }),
});

export const ins = pgTable("ins", {
  id: uuid().primaryKey().defaultRandom(),
  text: text().default("").notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  moved: uuid().references(() => actions.id),
});
