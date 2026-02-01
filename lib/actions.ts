"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type z from "zod";
import { db } from "./db/drizzle";
import { actions, ins, projects } from "./db/schema";
import type {
  editActionSchema,
  moveActionToProjectSchema,
  moveInProjectSchema,
  moveInSchema,
  upsertProjectSchema,
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
      type: data.type,
    })
    .returning({ id: actions.id });

  await db.update(ins).set({ moved: id }).where(eq(ins.id, data.inId));

  revalidatePath("/", "layout");
}

export async function moveInProjectAction(
  data: z.infer<typeof moveInProjectSchema>,
) {
  const [{ id }] = await db
    .insert(projects)
    .values({
      title: data.title,
      notes: data.notes,
      parentProjectId: data.parentProjectId,
    })
    .returning({ id: projects.id });

  await db.update(ins).set({ moved: id }).where(eq(ins.id, data.inId));

  revalidatePath("/", "layout");
}

export async function moveActionToProject(
  data: z.infer<typeof moveActionToProjectSchema>,
) {
  const [{ id }] = await db
    .insert(projects)
    .values({
      title: data.title,
      notes: data.notes,
      parentProjectId: data.parentProjectId,
    })
    .returning({ id: projects.id });

  await db.update(ins).set({ moved: id }).where(eq(ins.moved, data.actionId));
  await db.delete(actions).where(eq(actions.id, data.actionId));

  revalidatePath("/", "layout");
}

export async function deleteAction(id: string) {
  await db.delete(ins).where(eq(ins.moved, id));
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
      archived: data.archived,
      type: data.type,
    })
    .where(eq(actions.id, data.id));

  revalidatePath("/", "layout");
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/", "layout");
}

export async function upsertProject(data: z.infer<typeof upsertProjectSchema>) {
  if (!data.id) {
    await db.insert(projects).values({
      title: data.title,
      notes: data.notes,
      parentProjectId: data.parentProjectId,
    });
  } else {
    await db
      .update(projects)
      .set({
        title: data.title,
        notes: data.notes,
        parentProjectId: data.parentProjectId,
        completed: data.completed,
        archived: data.archived,
      })
      .where(eq(projects.id, data.id));
  }

  revalidatePath("/", "layout");
}
