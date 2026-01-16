"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db/drizzle";
import { ins } from "./db/schema";

export async function addIn(text: string) {
  await db.insert(ins).values({ text });
  revalidatePath("/", "layout");
}
