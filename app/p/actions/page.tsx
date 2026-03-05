import { and, asc, isNull } from "drizzle-orm";
import { Suspense } from "react";
import { getPopularProjects } from "@/lib/algorithms";
import { db } from "@/lib/db/drizzle";
import { actions, actionTags, projects, tags } from "@/lib/db/schema";
import { ActionsPageClient } from "./client";

export default async function Page() {
  const data = await db
    .select()
    .from(actions)
    .where(and(isNull(actions.completed), isNull(actions.archived)))
    .orderBy(asc(actions.deadline), asc(actions.createdAt));

  const projectsData = await db
    .select()
    .from(projects)
    .where(and(isNull(projects.completed), isNull(projects.archived)))
    .orderBy(asc(projects.createdAt));

  const popularProjects = await getPopularProjects(6);

  const allTags = await db.select().from(tags).orderBy(asc(tags.name));

  const allActionTags = await db.select().from(actionTags);

  return (
    <Suspense>
      <ActionsPageClient
        data={data}
        projectsData={projectsData}
        popularProjects={popularProjects}
        allTags={allTags}
        allActionTags={allActionTags}
      />
    </Suspense>
  );
}
