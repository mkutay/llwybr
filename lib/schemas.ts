import { z } from "zod";

export const moveInSchema = z.object({
  inId: z.uuid(),
  title: z.string().min(1),
  description: z.string(),
  notes: z.string(),
  deadline: z.date().optional(),
});
