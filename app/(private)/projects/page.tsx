import { asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import {
  CompletedButton,
  CreateButton,
  EditButton,
  EditDialog,
  EditDialogProvider,
} from "./client";

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
            className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end"
          >
            <div className="flex flex-col">
              <div className="flex flex-row gap-2 items-center">
                <CompletedButton value={item} />
                {item.title}
              </div>
              {item.notes && (
                <div className="ml-10 break-all text-muted-foreground">
                  <div>{item.notes}</div>
                </div>
              )}
            </div>
            <div className="flex flex-row gap-4 items-center ml-auto">
              <EditButton value={item} />
            </div>
          </div>
        ))}
        <CreateButton />
      </div>
    </EditDialogProvider>
  );
}
