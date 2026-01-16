import { z } from "zod";

export const moveInSchema = z.object({
  inId: z.uuid(),
  title: z.string().min(1),
  description: z.string(),
  notes: z.string(),
  deadline: z.date().nullable(),
});

export const editActionSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  description: z.string(),
  notes: z.string(),
  deadline: z.date().nullable(),
  projectId: z.uuid().nullable(),
  completed: z.boolean(),
});
