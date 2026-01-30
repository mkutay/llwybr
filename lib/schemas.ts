import { z } from "zod";
import { actionType } from "./db/schema";

export const moveInSchema = z.object({
  inId: z.uuid(),
  title: z.string().min(1),
  notes: z.string(),
  deadline: z.date().nullable(),
  projectId: z.uuid().nullable(),
  type: z.enum(actionType),
});

export const moveInProjectSchema = z.object({
  inId: z.uuid(),
  title: z.string().min(1, "Title is required."),
  notes: z.string(),
  parentProjectId: z.uuid().nullable(),
});

export const editActionSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  notes: z.string(),
  deadline: z.date().nullable(),
  projectId: z.uuid().nullable(),
  completed: z.date().nullable(),
  archived: z.date().nullable(),
  type: z.enum(actionType),
});

export const upsertProjectSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().min(1, "Title is required."),
  notes: z.string(),
  parentProjectId: z.uuid().nullable(),
  completed: z.date().nullable(),
  archived: z.date().nullable(),
});
