import {
  type AnyPgColumn,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const actionType = ["Waiting For", "Now", "Nothing"] as const;
export const actionTypeEnum = pgEnum("action_type", actionType);

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
  type: actionTypeEnum().default("Nothing").notNull(),
});

export const ins = pgTable("ins", {
  id: uuid().primaryKey().defaultRandom(),
  text: text().default("").notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  moved: uuid().references(() => actions.id),
});
