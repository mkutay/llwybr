import { asc, isNull } from "drizzle-orm";
import { EntityList } from "@/components/entity-list";
import { EntityListItem } from "@/components/entity-list-item";
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
      <EntityList>
        {data.map((item) => (
          <EntityListItem
            key={item.id}
            title={<span className="hyphens-auto">{item.text}</span>}
            trailing={<MoveButton id={item.id} text={item.text} />}
          />
        ))}
      </EntityList>
    </MoveDialogProvider>
  );
}
