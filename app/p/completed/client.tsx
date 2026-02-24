"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { format } from "date-fns";
import { ChevronDown, CircleCheck } from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { editAction, upsertProject } from "@/lib/actions";
import type { actions, projects } from "@/lib/db/schema";

type Action = typeof actions.$inferSelect;
type Project = typeof projects.$inferSelect;

type CompletedItem =
  | { kind: "action"; value: Action }
  | { kind: "project"; value: Project };

type PendingItem =
  | { kind: "action"; value: Action }
  | { kind: "project"; value: Project };

// ── Uncomplete dialog context ────────────────────────────────────────────────

const UncompleteContext = createContext<{
  requestAction: (action: Action) => void;
  requestProject: (project: Project) => void;
} | null>(null);

function useUncomplete() {
  const ctx = useContext(UncompleteContext);
  if (!ctx)
    throw new Error("UncompleteButton must be inside UncompleteDialogProvider");
  return ctx;
}

function UncompleteDialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingItem | null>(null);

  const handleUncomplete = async () => {
    if (!pending) return;
    if (pending.kind === "action") {
      await editAction({ ...pending.value, completed: null });
    } else {
      await upsertProject({ ...pending.value, completed: null });
    }
    toast.success("Marked as incomplete.");
    setPending(null);
  };

  return (
    <UncompleteContext.Provider
      value={{
        requestAction: (action) =>
          setPending({ kind: "action", value: action }),
        requestProject: (project) =>
          setPending({ kind: "project", value: project }),
      }}
    >
      {children}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as incomplete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move &ldquo;{pending?.value.title}&rdquo; back to your
              active
              {pending?.kind === "action" ? " actions" : " projects"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUncomplete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UncompleteContext.Provider>
  );
}

export function UncompleteButton({ value }: { value: Action }) {
  const { requestAction } = useUncomplete();
  return (
    <Button size="icon-sm" variant="ghost" onClick={() => requestAction(value)}>
      <CircleCheck />
    </Button>
  );
}

export function UncompleteProjectButton({ value }: { value: Project }) {
  const { requestProject } = useUncomplete();
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={() => requestProject(value)}
    >
      <CircleCheck />
    </Button>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────

export function CompletedView({
  actionsData,
  completedProjects,
  allProjects,
}: {
  actionsData: Action[];
  completedProjects: Project[];
  allProjects: Project[];
}) {
  // Read the browser's actual timezone at render time.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [timeZone],
  );

  const formatDay = (date: Date) => dateFormatter.format(date);

  // biome-ignore lint/correctness/useExhaustiveDependencies: that's a function
  const { data, dateKeys, totalCompleted } = useMemo(() => {
    const grouped = new Map<string, CompletedItem[]>();

    for (const action of actionsData) {
      if (!action.completed) continue;
      const key = formatDay(action.completed);
      const arr = grouped.get(key);
      if (!arr) grouped.set(key, [{ kind: "action", value: action }]);
      else arr.push({ kind: "action", value: action });
    }

    for (const project of completedProjects) {
      if (!project.completed) continue;
      const key = formatDay(project.completed);
      const arr = grouped.get(key);
      if (!arr) grouped.set(key, [{ kind: "project", value: project }]);
      else arr.push({ kind: "project", value: project });
    }

    const keys = Array.from(grouped.keys());
    const d = keys.map((date) => ({ date, items: grouped.get(date) || [] }));

    return {
      data: d,
      dateKeys: keys,
      totalCompleted: actionsData.length + completedProjects.length,
    };
  }, [actionsData, completedProjects]);

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
