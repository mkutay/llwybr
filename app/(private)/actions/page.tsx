import { format } from "date-fns";
import { asc, isNull } from "drizzle-orm";
import { EntityList } from "@/components/entity-list";
import { EntityListItem } from "@/components/entity-list-item";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  CompletedButton,
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
      <EntityList>
        {data.map((item) => (
          <EntityListItem
            key={item.id}
            leading={<CompletedButton value={item} />}
            title={item.title}
            description={
              item.notes ? (
                <div className="ml-10 break-all text-pretty text-justify text-muted-foreground">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {item.notes}
                  </pre>
                </div>
              ) : undefined
            }
            trailing={
              <>
                {item.deadline && (
                  <div
                    className={cn(
                      "font-mono text-sm whitespace-nowrap",
                      new Date() > item.deadline
                        ? "text-destructive"
                        : "text-foreground",
                    )}
                  >
                    {format(item.deadline, "PPp")}
                  </div>
                )}
                <EditButton value={item} />
              </>
            }
          />
        ))}
      </EntityList>
    </EditDialogProvider>
  );
}
