import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { projects } from "@/lib/db/schema";
import {
  CompletedButton,
  EditButton,
  EditDialog,
  EditDialogProvider,
} from "./client";
import { CreateProjectDialog } from "./create";

export default async function InsPage() {
  const data = await db
    .select()
    .from(projects)
    .where(eq(projects.completed, false))
    .orderBy(asc(projects.createdAt));

  return (
    <EditDialogProvider>
      <EditDialog projects={data} />
      <div className="divide-y divide-border flex flex-col py-4">
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
