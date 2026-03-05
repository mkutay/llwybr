"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { VariantProps } from "class-variance-authority";
import { Circle, CircleCheck, Ellipsis, XIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
import { ChooseTags } from "@/components/choose-tags";
import { DateTimePicker } from "@/components/date-time-picker";
import { Deadline } from "@/components/deadline";
import { createDialogContext } from "@/components/dialog-context";
import { TypeSelect } from "@/components/type-select";
import { Badge } from "@/components/ui/badge";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogNotes,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { deleteAction, editAction, moveActionToProject } from "@/lib/actions";
import type { actions, actionTags, projects, tags } from "@/lib/db/schema";
import { editActionSchema, moveActionToProjectSchema } from "@/lib/schemas";
import { getTagsString } from "@/lib/tags";

type Action = typeof actions.$inferSelect;

const { Provider: EditDialogProvider, useDialog: useEditDialog } =
  createDialogContext<Action>();

export { EditDialogProvider };

export function EditDialog({
  projects,
  popularProjects,
  allTags,
  actionTagIds,
}: {
  projects: Array<{ id: string; title: string }>;
  popularProjects: Array<{ id: string; title: string }>;
  allTags: Array<{ id: string; name: string }>;
  actionTagIds: Record<string, string[]>;
}) {
  const { open, value: action, closeDialog, setOpen } = useEditDialog();

  const form = useForm<z.infer<typeof editActionSchema>>({
    resolver: zodResolver(editActionSchema),
  });

  const onSubmit = async (data: z.infer<typeof editActionSchema>) => {
    closeDialog();
    await editAction(data);
    toast.success("Edited.");
  };

  const [openedForm, setOpenedForm] = useState("action");

  const projectForm = useForm<z.infer<typeof moveActionToProjectSchema>>({
    resolver: zodResolver(moveActionToProjectSchema),
  });

  // Reset form with value when it changes
  if (
    action &&
    (form.getValues().id !== action.id ||
      projectForm.getValues().actionId !== action.id)
  ) {
    form.reset({
      id: action.id,
      title: action.title,
      notes: action.notes,
      deadline: action.deadline,
      projectId: action.projectId,
      completed: action.completed,
      type: action.type,
      archived: action.archived,
      tagIds: actionTagIds[action.id] ?? [],
    });

    projectForm.reset({
      actionId: action.id,
      title: action.title,
      notes: action.notes,
      parentProjectId: null,
    });
  }

  const onSubmitProject = async (
    data: z.infer<typeof moveActionToProjectSchema>,
  ) => {
    closeDialog();
    await moveActionToProject(data);
    toast.success("Moved to projects.");
    form.reset();
    projectForm.reset();
    setOpenedForm("action");
  };

  const handleTabChange = (value: string) => {
    setOpenedForm(value);
    if (value === "project") {
      const values = form.getValues();
      projectForm.setValue("title", values.title);
      projectForm.setValue("notes", values.notes);
      projectForm.setValue("parentProjectId", values.projectId);
    } else {
      const values = projectForm.getValues();
      form.setValue("title", values.title);
      form.setValue("notes", values.notes);
      form.setValue("projectId", values.parentProjectId);
    }
  };

  const handleDelete = async () => {
    if (!action) return;
    closeDialog();
    await deleteAction(action.id);
    toast.success("Deleted.");
    form.reset();
    projectForm.reset();
    setOpenedForm("action");
  };

  const handleArchive = async () => {
    if (!action) return;
    closeDialog();
    await editAction({
      ...action,
      archived: new Date(),
      tagIds: actionTagIds[action.id] ?? [],
    });
    toast.success("Archived.");
    form.reset();
    projectForm.reset();
    setOpenedForm("action");
  };

  return (
    <>
      {open && (
        <DialogNotes>
          <ul className="space-y-2">
            <li>
              Actions are things that could be done <i>anytime</i>.
            </li>
            <li>Actions are physical and visible.</li>
          </ul>
        </DialogNotes>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <Tabs
          orientation="horizontal"
          defaultValue="action"
          value={openedForm}
          onValueChange={handleTabChange}
          className="hidden"
        >
          <DialogContent className="*:data-[slot=tabs-content]:space-y-4">
            <TabsContent value="action">
              <DialogHeader>
                <DialogTitle>Edit Action</DialogTitle>
                <DialogDescription>
                  Make changes to the action details and save.
                </DialogDescription>
              </DialogHeader>
              <form
                id="edit-action-form"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FieldGroup>
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Title</FieldLabel>
                        <Input
                          {...field}
                          id="title"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="notes"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Notes</FieldLabel>
                        <Textarea
                          {...field}
                          id="notes"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="deadline"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <DateTimePicker
                        label="Deadline"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error}
                        invalid={fieldState.invalid}
                      />
                    )}
                  />

                  <Controller
                    name="projectId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Project</FieldLabel>
                        <ChooseProject
                          projects={projects}
                          popularProjects={popularProjects}
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Type</FieldLabel>
                        <TypeSelect
                          value={field.value}
                          onChange={field.onChange}
                          invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="tagIds"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Tags</FieldLabel>
                        <ChooseTags
                          allTags={allTags}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </TabsContent>
            <TabsContent value="project">
              <DialogHeader>
                <DialogTitle>Move to Projects</DialogTitle>
                <DialogDescription>
                  Fill in the details to move this Action to your Projects.
                </DialogDescription>
              </DialogHeader>
              <form
                id="move-action-project-form"
                onSubmit={projectForm.handleSubmit(onSubmitProject)}
              >
                <FieldGroup>
                  <Controller
                    name="title"
                    control={projectForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Title</FieldLabel>
                        <Input
                          {...field}
                          id="title"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="notes"
                    control={projectForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Notes</FieldLabel>
                        <Textarea
                          {...field}
                          id="notes"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="parentProjectId"
                    control={projectForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Project</FieldLabel>
                        <ChooseProject
                          popularProjects={popularProjects}
                          projects={projects}
                          value={field.value}
                          onChange={field.onChange}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </TabsContent>
            <DialogFooter className="items-center">
              <TabsList className="mr-auto">
                <TabsTrigger value="action">Action</TabsTrigger>
                <TabsTrigger value="project">Project</TabsTrigger>
              </TabsList>
              <Button variant="destructive" onClick={handleDelete} size="sm">
                Delete
              </Button>
              <Button variant="outline" onClick={handleArchive} size="sm">
                Archive
              </Button>
              <Button variant="secondary" onClick={closeDialog} size="sm">
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                form={
                  openedForm === "action"
                    ? "edit-action-form"
                    : "move-action-project-form"
                }
              >
                {openedForm === "action" ? "Submit" : "Move"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Tabs>
      </Dialog>
    </>
  );
}

export function EditButton({
  value,
  variant = "secondary",
}: {
  value: Action;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  const { openDialog } = useEditDialog();

  return (
    <Button size="icon-sm" variant={variant} onClick={() => openDialog(value)}>
      <Ellipsis />
    </Button>
  );
}

export function CompletedButton({ value }: { value: Action }) {
  const handleComplete = async (val: Action) => {
    await editAction({ ...val, completed: new Date(), tagIds: [] });
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={() => handleComplete(value)}
      className="group"
    >
      <Circle className="group-hover:hidden flex" />
      <CircleCheck className="hidden group-hover:flex" />
    </Button>
  );
}

export function TagFilterBar({
  allTags,
  activeFilters,
  onToggle,
  onClear,
}: {
  allTags: Array<{ id: string; name: string }>;
  activeFilters: string[];
  onToggle: (tagId: string) => void;
  onClear: () => void;
}) {
  if (allTags.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap gap-0.5 justify-end">
      {activeFilters.length > 0 && (
        <Badge variant="secondary" asChild>
          <button type="button" onClick={onClear}>
            <XIcon className="size-3" />
          </button>
        </Badge>
      )}
      {allTags.map((tag) => {
        const active = activeFilters.includes(tag.id);
        return (
          <Badge key={tag.id} variant={active ? "default" : "outline"} asChild>
            <button type="button" onClick={() => onToggle(tag.id)}>
              {tag.name}
            </button>
          </Badge>
        );
      })}
    </div>
  );
}

export function ActionsPageClient({
  data,
  projectsData,
  popularProjects,
  allTags,
  allActionTags,
}: {
  data: Action[];
  projectsData: Array<typeof projects.$inferSelect>;
  popularProjects: Array<{ id: string; title: string }>;
  allTags: Array<typeof tags.$inferSelect>;
  allActionTags: Array<typeof actionTags.$inferSelect>;
}) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const actionTagIds: Record<string, string[]> = {};
  for (const at of allActionTags) {
    if (!actionTagIds[at.actionId]) actionTagIds[at.actionId] = [];
    actionTagIds[at.actionId].push(at.tagId);
  }

  const toggleFilter = (tagId: string) =>
    setActiveFilters((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );

  const clearFilters = () => setActiveFilters([]);

  const sorted = [
    ...data.filter((a) => a.type === "Now"),
    ...data.filter((a) => a.type === "Nothing"),
    ...data.filter((a) => a.type === "Waiting For"),
  ].filter((item) => {
    if (activeFilters.length === 0) return true;
    const itemTagIds = actionTagIds[item.id] ?? [];
    return activeFilters.every((tagId) => itemTagIds.includes(tagId));
  });

  return (
    <EditDialogProvider>
      <EditDialog
        projects={projectsData}
        popularProjects={popularProjects}
        allTags={allTags}
        actionTagIds={actionTagIds}
      />
      <TagFilterBar
        allTags={allTags}
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onClear={clearFilters}
      />
      <div className="divide-y divide-border flex flex-col">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="py-2 flex flex-row flex-wrap gap-1 justify-between items-end"
          >
            <div className="flex flex-col">
              <div className="flex flex-row gap-2 items-center">
                <CompletedButton value={item} />
                {item.type !== "Nothing" && `[${item.type.toUpperCase()}] `}
                {`${getTagsString(actionTagIds[item.id] ?? [], allTags)} `}
                {item.projectId
                  ? `(${projectsData.find((p) => item.projectId === p.id)?.title}) `
                  : ""}
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
