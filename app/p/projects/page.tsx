import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { and, asc, isNull } from "drizzle-orm";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Deadline } from "@/components/deadline";
import { Button } from "@/components/ui/button";
import { getPopularProjects } from "@/lib/algorithms";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";
import {
  CompletedButton as ActionsCompletedButton,
  EditButton as ActionsEditButton,
  EditDialog as ActionsEditDialog,
  EditDialogProvider as ActionsEditDialogProvider,
} from "../actions/client";
import {
  CompletedButton,
  EditButton,
  EditDialog,
  EditDialogProvider,
} from "./client";

export default async function Page() {
  const projectsList = await db
    .select()
    .from(projects)
    .where(and(isNull(projects.completed), isNull(projects.archived)))
    .orderBy(asc(projects.createdAt));

  const actionsByProject = await db
    .select()
    .from(actions)
    .where(and(isNull(actions.completed)));

  const data = projectsList.map((project) => ({
    ...project,
    actions: actionsByProject.filter(
      (action) => action.projectId === project.id,
    ),
  }));

  const popularProjects = await getPopularProjects(6);

  return (
    <ActionsEditDialogProvider>
      <ActionsEditDialog projects={data} popularProjects={popularProjects} />
      <EditDialogProvider>
        <EditDialog projects={data} popularProjects={popularProjects} />
        <AccordionPrimitive.Root
          data-slot="accordion"
          type="multiple"
          className="divide-y divide-border flex flex-col"
        >
          {data
            .filter((p) => p.archived === null)
            .map((item) => (
              <AccordionPrimitive.Item
                data-slot="accordion-item"
                key={item.id}
                value={item.id}
              >
                <AccordionPrimitive.Header>
                  <div className="flex flex-row flex-wrap gap-1 justify-between items-end py-2">
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-row gap-0.5 items-center">
                          {item.actions.filter((a) => a.archived === null)
                            .length > 0 ? (
                            <AccordionPrimitive.Trigger
                              data-slot="accordion-trigger"
                              className="transition-all outline-none [&[data-state=open]>svg]:rotate-180"
                              asChild
                            >
                              <Button variant="ghost" size="icon-sm">
                                <ChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
                              </Button>
                            </AccordionPrimitive.Trigger>
                          ) : (
                            <Button variant="ghost" size="icon-sm" disabled>
                              <ChevronRight className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
                            </Button>
                          )}
                          <CompletedButton
                            value={item}
                            disabled={item.actions.length > 0}
                          />
                        </div>
                        {item.title}
                      </div>
                      {item.notes && (
                        <div className="ml-18.5 break-all text-pretty text-justify text-muted-foreground">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {item.notes}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row gap-4 items-center ml-auto">
                      <EditButton
                        value={{
                          ...item,
                          hasChildren:
                            item.actions.length > 0 ||
                            projectsList.filter(
                              (p) => p.parentProjectId === item.id,
                            ).length > 0,
                        }}
                      />
                    </div>
                  </div>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content
                  data-slot="accordion-content"
                  className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden pl-8.5"
                >
                  {item.actions
                    .filter((a) => a.archived === null)
                    .map((action) => (
                      <div
                        key={action.id}
                        className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end border-t border-border"
                      >
                        <div className="flex flex-col">
                          <div className="flex flex-row gap-2 items-center">
                            <ActionsCompletedButton value={action} />
                            {action.type !== "Nothing" &&
                              `[${action.type.toUpperCase()}] `}
                            {action.title}
                          </div>
                          {action.notes && (
                            <div className="ml-10 break-all text-pretty text-justify text-muted-foreground">
                              <pre className="font-mono text-sm whitespace-pre-wrap">
                                {action.notes}
                              </pre>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-row gap-4 items-center ml-auto">
                          {action.deadline && (
                            <Deadline
                              deadline={action.deadline}
                              className="text-sm"
                            />
                          )}
                          <ActionsEditButton value={action} variant="outline" />
                        </div>
                      </div>
                    ))}
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
        </AccordionPrimitive.Root>
      </EditDialogProvider>
    </ActionsEditDialogProvider>
  );
}
