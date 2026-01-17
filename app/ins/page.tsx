import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { ins, projects } from "@/lib/db/schema";
import { MoveButton, MoveDialog, MoveDialogProvider } from "./client";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function InsPage() {
  const data = await db
    .select()
    .from(ins)
    .where(eq(ins.moved, false))
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
            className="py-2 flex flex-row justify-between items-center"
          >
            <span className="hyphens-auto">{item.text}</span>
            <MoveButton id={item.id} text={item.text} />
          </div>
        ))}
      </div>
    </MoveDialogProvider>
  );
}
