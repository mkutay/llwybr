import { and, asc, isNull } from "drizzle-orm";
import { getPopularProjects } from "@/lib/algorithms";
import { db } from "@/lib/db/drizzle";
import { ins, projects } from "@/lib/db/schema";
import { MoveButton, MoveDialog, MoveDialogProvider } from "./client";

export default async function Page() {
  const data = await db
    .select()
    .from(ins)
    .where(isNull(ins.moved))
    .orderBy(asc(ins.createdAt));

  const projectsData = await db
    .select()
    .from(projects)
    .where(and(isNull(projects.completed), isNull(projects.archived)))
    .orderBy(asc(projects.createdAt));

  const popularProjects = await getPopularProjects(6);

  return (
    <MoveDialogProvider>
      <MoveDialog projects={projectsData} popularProjects={popularProjects} />
      <div className="divide-y divide-border flex flex-col">
        {data.map((item) => (
          <div
            className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end"
            key={item.id}
          >
            <div className="flex flex-col">
              <div className="flex flex-row gap-2 items-center">
                <span className="hyphens-auto">{item.text}</span>
              </div>
            </div>
            <div className="flex flex-row gap-4 items-center ml-auto">
              <MoveButton id={item.id} text={item.text} />
            </div>
          </div>
        ))}
      </div>
    </MoveDialogProvider>
  );
}
