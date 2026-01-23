"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type z from "zod";
import { db } from "./db/drizzle";
import { actions, ins, projects } from "./db/schema";
import type {
  createProjectSchema,
  editActionSchema,
  editProjectSchema,
  moveInSchema,
} from "./schemas";

export async function deleteIn(id: string) {
  await db.delete(ins).where(eq(ins.id, id));
  revalidatePath("/", "layout");
}

export async function addIn(text: string) {
  await db.insert(ins).values({ text });
  revalidatePath("/", "layout");
}

export async function moveInAction(data: z.infer<typeof moveInSchema>) {
  const [{ id }] = await db
    .insert(actions)
    .values({
      title: data.title,
      notes: data.notes,
      deadline: data.deadline,
      projectId: data.projectId,
    })
    .returning({ id: actions.id });

  await db.update(ins).set({ moved: id }).where(eq(ins.id, data.inId));

  revalidatePath("/", "layout");
}

export async function deleteAction(id: string) {
  await db.delete(actions).where(eq(actions.id, id));
  revalidatePath("/", "layout");
}

export async function editAction(data: z.infer<typeof editActionSchema>) {
  await db
    .update(actions)
    .set({
      title: data.title,
      notes: data.notes,
      deadline: data.deadline,
      projectId: data.projectId,
      completed: data.completed,
    })
    .where(eq(actions.id, data.id));

  revalidatePath("/", "layout");
}

export async function createProject(data: z.infer<typeof createProjectSchema>) {
  await db.insert(projects).values({
    title: data.title,
    notes: data.notes,
    parentProjectId: data.parentProjectId,
  });

  revalidatePath("/", "layout");
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/", "layout");
}

export async function editProject(data: z.infer<typeof editProjectSchema>) {
  await db
    .update(projects)
    .set({
      title: data.title,
      notes: data.notes,
      parentProjectId: data.parentProjectId,
      completed: data.completed,
    })
    .where(eq(projects.id, data.id));

  revalidatePath("/", "layout");
}
