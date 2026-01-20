import { asc, isNull } from "drizzle-orm";
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
    .orderBy(asc(projects.createdAt));

  return (
    <MoveDialogProvider>
      <MoveDialog projects={projectsData} />

      <div className="divide-y divide-border flex flex-col">
        {data.map((item) => (
          <div
            key={item.id}
            className="py-2 flex flex-row flex-wrap gap-2 justify-between md:items-center"
          >
            <span className="hyphens-auto">{item.text}</span>
            <MoveButton id={item.id} text={item.text} className="ml-auto" />
          </div>
        ))}
      </div>
    </MoveDialogProvider>
  );
}
