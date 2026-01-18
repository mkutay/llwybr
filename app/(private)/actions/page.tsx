import { format } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import {
  CompletedButton,
  EditButton,
  EditDialog,
  EditDialogProvider,
} from "./client";

export default async function InsPage() {
  const data = await db
    .select()
    .from(actions)
    .where(eq(actions.completed, false))
    .orderBy(asc(actions.deadline), asc(actions.createdAt));

  const projectsData = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.createdAt));

  return (
    <EditDialogProvider>
      <EditDialog projects={projectsData} />
      <div className="divide-y divide-border flex flex-col">
        {data.map((item) => (
          <div
            key={item.id}
            className="py-2 flex flex-row flex-wrap justify-between md:items-center"
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
            <div className="flex flex-row gap-4 items-center ml-auto">
              {item.deadline && (
                <div className="font-mono text-sm whitespace-nowrap">
                  {format(item.deadline, "PPp")}
                </div>
              )}
              <EditButton value={item} />
            </div>
          </div>
        ))}
      </div>
    </EditDialogProvider>
  );
}
