import { and, asc, isNull } from "drizzle-orm";
import { getPopularProjects } from "@/lib/algorithms";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import {
  CompletedButton,
  Deadline,
  EditButton,
  EditDialog,
  EditDialogProvider,
} from "./client";

export default async function Page() {
  const data = await db
    .select()
    .from(actions)
    .where(and(isNull(actions.completed), isNull(actions.archived)))
    .orderBy(asc(actions.deadline), asc(actions.createdAt));

  const projectsData = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.createdAt));

  const popularProjects = await getPopularProjects(6);

  const sortedData = data.sort((a, b) => {
    if (a.type === "Now") return -1;
    if (b.type === "Now") return 1;
    if (a.type === "Waiting For") return 1;
    if (b.type === "Waiting For") return -1;
    return 0;
  });

  return (
    <EditDialogProvider>
      <EditDialog projects={projectsData} popularProjects={popularProjects} />
      <div className="divide-y divide-border flex flex-col">
        {sortedData.map((item) => (
          <div
            key={item.id}
            className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end"
          >
            <div className="flex flex-col">
              <div className="flex flex-row gap-2 items-center">
                <CompletedButton value={item} />
                {item.type === "Now" && "[NOW] "}
                {item.type === "Waiting For" && "[WAITING FOR] "}
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
              <EditButton value={item} />
            </div>
          </div>
        ))}
      </div>
    </EditDialogProvider>
  );
}
