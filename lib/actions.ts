"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type z from "zod";
import { db } from "./db/drizzle";
import { actions, actionTags, ins, projects, tags } from "./db/schema";
import type {
  editActionSchema,
  moveActionToProjectSchema,
  moveInProjectSchema,
  moveInSchema,
  moveProjectToActionSchema,
  upsertProjectSchema,
} from "./schemas";

async function revalidate() {
  revalidatePath("/p/actions");
  revalidatePath("/p/projects");
  revalidatePath("/p/ins");
  revalidatePath("/p/archive");
  revalidatePath("/p/completed");
  revalidatePath("/");
}

export async function createTag(name: string) {
  const [tag] = await db.insert(tags).values({ name: name.trim() }).returning();
  await revalidate();
  return tag;
}

export async function updateTag(id: string, name: string) {
  const [tag] = await db
    .update(tags)
    .set({ name: name.trim() })
    .where(eq(tags.id, id))
    .returning();
  await revalidate();
  return tag;
}

export async function deleteTag(id: string) {
  await db.delete(actionTags).where(eq(actionTags.tagId, id));
  await db.delete(tags).where(eq(tags.id, id));
  await revalidate();
}

export async function deleteIn(id: string) {
  await db.delete(ins).where(eq(ins.id, id));
  await revalidate();
}

export async function addIn(text: string) {
  await db.insert(ins).values({ text });
  await revalidate();
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

  if (data.tagIds.length > 0) {
    await db
      .insert(actionTags)
      .values(data.tagIds.map((tagId) => ({ actionId: id, tagId })));
  }

  await revalidate();
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

  await revalidate();
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
  await db.delete(actionTags).where(eq(actionTags.actionId, data.actionId));
  await db.delete(actions).where(eq(actions.id, data.actionId));

  await revalidate();
}

export async function moveProjectToAction(
  data: z.infer<typeof moveProjectToActionSchema>,
) {
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

  await db
    .update(ins)
    .set({ moved: id })
    .where(eq(ins.moved, data.sourceProjectId));

  if (data.tagIds.length > 0) {
    await db
      .insert(actionTags)
      .values(data.tagIds.map((tagId) => ({ actionId: id, tagId })));
  }

  await deleteProject(data.sourceProjectId);
  await revalidate();
}

export async function deleteAction(id: string) {
  await db.delete(ins).where(eq(ins.moved, id));
  await db.delete(actionTags).where(eq(actionTags.actionId, id));
  await db.delete(actions).where(eq(actions.id, id));
  await revalidate();
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

  // Sync tags: delete existing, insert new
  await db.delete(actionTags).where(eq(actionTags.actionId, data.id));
  if (data.tagIds.length > 0) {
    await db
      .insert(actionTags)
      .values(data.tagIds.map((tagId) => ({ actionId: data.id, tagId })));
  }

  await revalidate();
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
  await revalidate();
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

  await revalidate();
}
