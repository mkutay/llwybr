import { z } from "zod";

export const moveInSchema = z.object({
  inId: z.uuid(),
  title: z.string().min(1),
  notes: z.string(),
  deadline: z.date().nullable(),
  projectId: z.uuid().nullable(),
});

export const editActionSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  notes: z.string(),
  deadline: z.date().nullable(),
  projectId: z.uuid().nullable(),
  completed: z.date().nullable(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1),
  notes: z.string(),
  parentProjectId: z.uuid().nullable(),
});

export const editProjectSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  notes: z.string(),
  parentProjectId: z.uuid().nullable(),
  completed: z.date().nullable(),
});
