import { asc, isNull } from "drizzle-orm";
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
    .where(isNull(actions.completed))
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
            className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end"
          >
            <div className="flex flex-col">
              <div className="flex flex-row gap-2 items-center">
                <CompletedButton value={item} />
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
