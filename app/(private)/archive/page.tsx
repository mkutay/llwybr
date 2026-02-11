import { asc, isNotNull } from "drizzle-orm";
import { Deadline } from "@/components/deadline";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import { UnarchiveActionButton, UnarchiveProjectButton } from "./client";

export default async function Page() {
  const archivedProjects = await db
    .select()
    .from(projects)
    .where(isNotNull(projects.archived))
    .orderBy(asc(projects.archived), asc(projects.createdAt));

  const archivedActions = await db
    .select()
    .from(actions)
    .where(isNotNull(actions.archived))
    .orderBy(
      asc(actions.deadline),
      asc(actions.createdAt),
      asc(actions.archived),
    );

  const projectsData = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.createdAt));

  return (
    <div className="divide-y divide-border flex flex-col">
      {archivedActions.map((item) => (
        <div
          key={item.id}
          className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end"
        >
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 items-center">
              <UnarchiveActionButton value={item} />
              {item.projectId
                ? `(${projectsData.find((p) => item.projectId === p.id)?.title}) `
                : ""}
              {item.title}
            </div>
            {item.notes && (
              <div className="ml-10 break-all text-pretty text-justify text-muted-foreground">
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {item.notes}
                </pre>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-4 items-center ml-auto">
            {item.deadline && (
              <Deadline deadline={item.deadline} className="text-sm" />
            )}
          </div>
        </div>
      ))}
      {archivedProjects.map((item) => (
        <div
          key={item.id}
          className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end"
        >
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 items-center">
              <UnarchiveProjectButton value={item} />
              {item.parentProjectId
                ? `(${projectsData.find((p) => item.parentProjectId === p.id)?.title}) `
                : ""}
              {item.title}
            </div>
            {item.notes && (
              <div className="ml-10 break-all text-pretty text-justify text-muted-foreground">
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {item.notes}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
