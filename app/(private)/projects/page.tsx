import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import {
  CompletedButton,
  EditButton,
  EditDialog,
  EditDialogProvider,
} from "./client";
import { CreateProjectDialog } from "./create";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function InsPage() {
  const projectsList = await db
    .select()
    .from(projects)
    .where(eq(projects.completed, false))
    .orderBy(asc(projects.createdAt));

  const actionsByProject = await db
    .select()
    .from(actions)
    .where(eq(actions.completed, false));

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
            className="py-2 flex flex-row justify-between items-center"
          >
            <div className="flex flex-row gap-3 items-center">
              <CompletedButton value={item} />
              <div className="flex flex-col gap-1">
                <div>{item.title}</div>
                {item.description && <div>{item.description}</div>}
                {item.notes && <div>{item.notes}</div>}
              </div>
            </div>
            <EditButton value={item} />
          </div>
        ))}
        <CreateProjectDialog projects={data} />
      </div>
    </EditDialogProvider>
  );
}
