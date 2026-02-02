"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Circle, CircleCheck, Ellipsis } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
import { DateTimePicker } from "@/components/date-time-picker";
import { createDialogContext } from "@/components/dialog-context";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteProject,
  moveProjectToAction,
  upsertProject,
} from "@/lib/actions";
import { actionType, type projects } from "@/lib/db/schema";
import { moveProjectToActionSchema, upsertProjectSchema } from "@/lib/schemas";

type Project = typeof projects.$inferSelect & {
  hasChildren?: boolean;
};

const { Provider: EditDialogProvider, useDialog: useEditDialog } =
  createDialogContext<Project | null>();

export { EditDialogProvider };

export function EditDialog({
  projects,
  popularProjects,
}: {
  projects: Array<{ id: string; title: string }>;
  popularProjects: Array<{ id: string; title: string }>;
}) {
  const { open, value: project, closeDialog, setOpen } = useEditDialog();
  const [openedForm, setOpenedForm] = useState("project");

  const form = useForm<z.infer<typeof upsertProjectSchema>>({
    resolver: zodResolver(upsertProjectSchema),
    defaultValues: {
      id: undefined,
      title: "",
      notes: "",
      completed: null,
      parentProjectId: null,
      archived: null,
    },
  });

  const actionForm = useForm<z.infer<typeof moveProjectToActionSchema>>({
    resolver: zodResolver(moveProjectToActionSchema),
  });

  // Reset form when project changes (edit mode)
  if (project && form.getValues().id !== project.id) {
    // Edit mode: populate with project data
    form.reset({
      id: project.id,
      title: project.title,
      notes: project.notes,
      completed: project.completed,
      parentProjectId: project.parentProjectId,
      archived: project.archived,
    });

    actionForm.reset({
      sourceProjectId: project.id,
      title: project.title,
      notes: project.notes,
      deadline: null,
      projectId: null,
      type: "Nothing",
    });
  }

  const onSubmit = async (data: z.infer<typeof upsertProjectSchema>) => {
    closeDialog();
    await upsertProject(data);
    toast.success("Edited.");
    setOpenedForm("project");
  };

  const onSubmitAction = async (
    data: z.infer<typeof moveProjectToActionSchema>,
  ) => {
    closeDialog();
    await moveProjectToAction(data);
    toast.success("Moved to actions.");
    form.reset();
    actionForm.reset();
    setOpenedForm("project");
  };

  const handleDelete = async () => {
    if (!project) return;
    closeDialog();
    await deleteProject(project.id);
    toast.success("Deleted.");
    form.reset();
    actionForm.reset();
    setOpenedForm("project");
  };

  const handleArchive = async () => {
    if (!project) return;
    closeDialog();
    await upsertProject({ ...project, archived: new Date() });
    toast.success("Archived.");
    form.reset();
    actionForm.reset();
    setOpenedForm("project");
  };

  const handleTabChange = (value: string) => {
    setOpenedForm(value);
    if (value === "action") {
      const values = form.getValues();
      actionForm.setValue("title", values.title);
      actionForm.setValue("notes", values.notes);
      actionForm.setValue("projectId", values.parentProjectId);
    } else {
      const values = actionForm.getValues();
      form.setValue("title", values.title);
      form.setValue("notes", values.notes);
      form.setValue("parentProjectId", values.projectId);
    }
  };

  if (!project) return null;

  return (
    <>
      {open &&
        (openedForm === "project" ? (
          <DialogNotes>
            <ul className="space-y-2">
              <li>Create "completable" projects.</li>
              <li>Projects should have a clear end goal or deliverable.</li>
            </ul>
          </DialogNotes>
        ) : (
          <DialogNotes>
            <ul className="space-y-2">
              <li>
                Actions are things that could be done <i>anytime</i>.
              </li>
              <li>Actions are physical and visible.</li>
            </ul>
          </DialogNotes>
        ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <Tabs
          orientation="horizontal"
          value={openedForm}
          onValueChange={handleTabChange}
          className="hidden"
        >
          <DialogContent className="*:data-[slot=tabs-content]:space-y-4">
            <TabsContent value="project">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Make changes to the project details and save.
                </DialogDescription>
              </DialogHeader>
              <form
                id="edit-project-form"
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
                    name="parentProjectId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Parent</FieldLabel>
                        <ChooseProject
                          popularProjects={popularProjects.filter(
                            (p) => p.id !== project.id,
                          )}
                          projects={projects.filter((p) => p.id !== project.id)}
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
            <TabsContent value="action">
              <DialogHeader>
                <DialogTitle>Move to Actions</DialogTitle>
                <DialogDescription>
                  Fill in the details to move this Project to your Actions.
                </DialogDescription>
              </DialogHeader>
              <form
                id="move-project-action-form"
                onSubmit={actionForm.handleSubmit(onSubmitAction)}
              >
                <FieldGroup>
                  <Controller
                    name="title"
                    control={actionForm.control}
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
                    control={actionForm.control}
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
                    control={actionForm.control}
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
                    control={actionForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Project</FieldLabel>
                        <ChooseProject
                          popularProjects={popularProjects.filter(
                            (p) => p.id !== project.id,
                          )}
                          projects={projects.filter((p) => p.id !== project.id)}
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
                    control={actionForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Type</FieldLabel>
                        <Select
                          defaultValue="Nothing"
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionType.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                <TabsTrigger value="project">Project</TabsTrigger>
                <TabsTrigger value="action" disabled={project.hasChildren}>
                  Action
                </TabsTrigger>
              </TabsList>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={project.hasChildren}
                type="button"
              >
                Delete
              </Button>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={handleArchive}
                disabled={project.hasChildren}
              >
                Archive
              </Button>

              <Button
                variant="secondary"
                onClick={closeDialog}
                type="button"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={
                  openedForm === "project"
                    ? "edit-project-form"
                    : "move-project-action-form"
                }
                size="sm"
              >
                {openedForm === "project" ? "Submit" : "Move"}
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
  className,
}: {
  value: Project;
  className?: string;
}) {
  const { openDialog } = useEditDialog();

  return (
    <Button
      size="icon-sm"
      onClick={() => openDialog(value)}
      variant="secondary"
      className={className}
    >
      <Ellipsis />
    </Button>
  );
}

export function CompletedButton({
  value,
  disabled = false,
}: {
  value: Project;
  disabled?: boolean;
}) {
  const handleComplete = async (val: Project) => {
    await upsertProject({ ...val, completed: new Date() });
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={() => handleComplete(value)}
      className="group"
      disabled={disabled}
    >
      <Circle className="group-hover:hidden flex" />
      <CircleCheck className="hidden group-hover:flex" />
    </Button>
  );
}
