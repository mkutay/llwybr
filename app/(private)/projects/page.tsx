import { asc, isNull } from "drizzle-orm";
import { EntityList } from "@/components/entity-list";
import { EntityListItem } from "@/components/entity-list-item";
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
      <EntityList>
        {data.map((item) => (
          <EntityListItem
            key={item.id}
            leading={<CompletedButton value={item} />}
            title={item.title}
            description={
              item.notes ? (
                <div className="ml-10 break-all text-muted-foreground">
                  <div>{item.notes}</div>
                </div>
              ) : undefined
            }
            trailing={<EditButton value={item} />}
          />
        ))}
        <CreateButton />
      </EntityList>
    </EditDialogProvider>
  );
}
