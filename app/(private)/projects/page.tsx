import { asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import {
  CompletedButton,
  EditButton,
  EditDialog,
  EditDialogProvider,
} from "./client";
import { CreateProjectDialog } from "./create";

export default async function Page() {
  const projectsList = await db
    .select()
    .from(projects)
    .where(isNull(projects.completed))
    .orderBy(asc(projects.createdAt));

  const actionsByProject = await db
    .select()
    .from(actions)
    .where(isNull(actions.completed));

  const data = projectsList.map((project) => ({
    ...project,
    actions: actionsByProject.filter(
      (action) => action.projectId === project.id,
    ),
  }));

  return (
    <EditDialogProvider>
      <EditDialog projects={data} />
      <div className="divide-y divide-border flex flex-col">
        {data.map((item) => (
          <div
            key={item.id}
            className="py-2 flex flex-row gap-2 flex-wrap justify-between md:items-center"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-row gap-2 items-center">
                <CompletedButton value={item} />
                {item.title}
              </div>
              {(item.description || item.notes) && (
                <div className="ml-10 flex flex-col gap-1 break-all text-muted-foreground">
                  {item.description && <div>{item.description}</div>}
                  {item.notes && <div>{item.notes}</div>}
                </div>
              )}
            </div>
            <EditButton value={item} className="ml-auto" />
          </div>
        ))}
        <CreateProjectDialog projects={data} />
      </div>
    </EditDialogProvider>
  );
}
