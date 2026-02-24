import { desc, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import { CompletedView } from "./client";

export default async function Page() {
  const actionsData = await db
    .select()
    .from(actions)
    .where(isNotNull(actions.completed))
    .orderBy(desc(actions.completed));

  const completedProjects = await db
    .select()
    .from(projects)
    .where(isNotNull(projects.completed))
    .orderBy(desc(projects.completed));

  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));

  return (
    <CompletedView
      actionsData={actionsData}
      completedProjects={completedProjects}
      allProjects={allProjects}
    />
  );
}
