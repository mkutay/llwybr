import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { format } from "date-fns";
import { desc, isNotNull } from "drizzle-orm";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import {
  UncompleteButton,
  UncompleteDialogProvider,
  UncompleteProjectButton,
} from "./client";

type CompletedItem =
  | { kind: "action"; value: typeof actions.$inferSelect }
  | { kind: "project"; value: typeof projects.$inferSelect };

export default async function Page() {
  const actionsData = await db
    .select()
    .from(actions)
    .where(isNotNull(actions.completed))
    .orderBy(desc(actions.completed));

  const completedProjects = await db
    .select()
    .from(projects)
    .where(isNotNull(projects.completed))
    .orderBy(desc(projects.completed));

  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));

  // Group actions and projects by completion date
  const grouped = new Map<string, CompletedItem[]>();

  for (const action of actionsData) {
    if (!action.completed) continue;

    const key = format(action.completed, "PP");
    const arr = grouped.get(key);
    if (!arr) {
      grouped.set(key, [{ kind: "action", value: action }]);
    } else {
      arr.push({ kind: "action", value: action });
    }
  }

  for (const project of completedProjects) {
    if (!project.completed) continue;

    const key = format(project.completed, "PP");
    const arr = grouped.get(key);
    if (!arr) {
      grouped.set(key, [{ kind: "project", value: project }]);
    } else {
      arr.push({ kind: "project", value: project });
    }
  }

  const dateKeys = Array.from(grouped.keys());

  const data = dateKeys.map((date) => ({
    date,
    items: grouped.get(date) || [],
  }));

  const totalCompleted = actionsData.length + completedProjects.length;
  const numDays = dateKeys.length || 1;
  const avgPerDay = (totalCompleted / numDays).toFixed(1);
  const maxGroup = data.reduce(
    (max, g) => (g.items.length > max.items.length ? g : max),
    data[0],
  );

  return (
    <UncompleteDialogProvider>
      {totalCompleted > 0 && (
        <div className="flex flex-row flex-wrap gap-4 text-sm font-mono text-muted-foreground mx-auto w-fit">
          <span>total: {totalCompleted}</span>
          <span>avg/day: {avgPerDay}</span>
          {maxGroup && (
            <span>
              max: {maxGroup.items.length} ({maxGroup.date})
            </span>
          )}
        </div>
      )}
      <AccordionPrimitive.Root
        data-slot="accordion"
        type="multiple"
        className="divide-y divide-border flex flex-col"
      >
        {data.map((group) => (
          <AccordionPrimitive.Item
            data-slot="accordion-item"
            key={group.date}
            value={group.date}
          >
            <AccordionPrimitive.Header>
              <div className="flex flex-row flex-wrap gap-1 justify-between items-end py-2">
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center">
                    <div className="flex flex-row gap-0.5 items-center">
                      <AccordionPrimitive.Trigger
                        data-slot="accordion-trigger"
                        className="transition-all outline-none [&[data-state=open]>svg]:rotate-180"
                        asChild
                      >
                        <Button variant="ghost" size="icon-sm">
                          <ChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
                        </Button>
                      </AccordionPrimitive.Trigger>
                    </div>
                    {group.date}
                  </div>
                </div>
                <div className="font-mono ml-auto font-sm">
                  {`${group.items.length} item${group.items.length > 1 ? "s" : ""}`}
                </div>
              </div>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              data-slot="accordion-content"
              className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden pl-8.5"
            >
              {group.items
                .sort(
                  (a, b) =>
                    (b.value.completed?.valueOf() ?? 0) -
                    (a.value.completed?.valueOf() ?? 0),
                )
                .map((item) => (
                  <div
                    key={item.value.id}
                    className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end border-t border-border"
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-2 items-center">
                        {item.kind === "action" ? (
                          <UncompleteButton value={item.value} />
                        ) : (
                          <UncompleteProjectButton value={item.value} />
                        )}
                        {item.kind === "action" &&
                          item.value.type !== "Nothing" &&
                          `[${item.value.type.toUpperCase()}] `}
                        {item.kind === "action" &&
                          item.value.projectId &&
                          `(${allProjects.find((p) => (item.value as typeof actions.$inferSelect).projectId === p.id)?.title}) `}
                        {item.kind === "project" &&
                          item.value.parentProjectId &&
                          `(${allProjects.find((p) => (item.value as typeof projects.$inferSelect).parentProjectId === p.id)?.title}) `}
                        {item.value.title}
                        {item.kind === "project" && (
                          <span className="text-muted-foreground text-sm font-mono">
                            project
                          </span>
                        )}
                      </div>
                      {item.value.notes && (
                        <div className="ml-10 break-all text-pretty text-justify text-muted-foreground">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {item.value.notes}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="ml-auto text-sm font-mono">
                      {item.kind === "action" && item.value.deadline
                        ? `${format(item.value.deadline, "PP, HH:mm")} -> `
                        : ""}
                      {item.value.completed
                        ? format(item.value.completed, "PP, HH:mm")
                        : ""}
                    </div>
                  </div>
                ))}
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </UncompleteDialogProvider>
  );
}
