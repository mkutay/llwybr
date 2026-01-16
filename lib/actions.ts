"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type z from "zod";
import { db } from "./db/drizzle";
import { actions, ins } from "./db/schema";
import type { moveInSchema } from "./schemas";

export async function addIn(text: string) {
  await db.insert(ins).values({ text });
  
  revalidatePath("/", "layout");
}

export async function moveInAction(data: z.infer<typeof moveInSchema>) {
  await db.update(ins).set({ moved: true }).where(eq(ins.id, data.inId));
  await db.insert(actions).values({
    title: data.title,
    description: data.description,
    notes: data.notes,
    deadline: data.deadline,
  });

  revalidatePath("/", "layout");
}
