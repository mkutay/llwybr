"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Circle, CircleCheck, Ellipsis } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
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
import { Textarea } from "@/components/ui/textarea";
import { deleteProject, upsertProject } from "@/lib/actions";
import type { projects } from "@/lib/db/schema";
import { upsertProjectSchema } from "@/lib/schemas";

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

  // Reset form when project changes (edit mode) or becomes null (create mode)
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
  } else if (project === null && form.getValues().id !== undefined) {
    // Create mode: reset to empty values
    form.reset({
      id: undefined,
      title: "",
      notes: "",
      completed: null,
      parentProjectId: null,
      archived: null,
    });
  }

  const onSubmit = async (data: z.infer<typeof upsertProjectSchema>) => {
    closeDialog();
    await upsertProject(data);
    toast.success(project ? "Edited." : "Project created successfully.");
  };

  const handleDelete = async () => {
    if (!project) return;
    closeDialog();
    await deleteProject(project.id);
    toast.success("Deleted.");
    form.reset();
  };

  const handleArchive = async () => {
    if (!project) return;
    closeDialog();
    await upsertProject({ ...project, archived: new Date() });
    toast.success("Archived.");
    form.reset();
  };

  return (
    <>
      {open && (
        <DialogNotes>
          <ul className="space-y-2">
            <li>Create "completable" projects.</li>
            <li>Projects should have a clear end goal or deliverable.</li>
          </ul>
        </DialogNotes>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {project ? "Edit Project" : "Create Project"}
            </DialogTitle>
            <DialogDescription>
              {project
                ? "Make changes to the project details and save."
                : "Fill in the details to create a new project."}
            </DialogDescription>
          </DialogHeader>
          <form id="edit-project-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                        (p) => p.id !== project?.id,
                      )}
                      projects={projects.filter((p) => p.id !== project?.id)}
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
          <DialogFooter>
            {project && (
              <>
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
              </>
            )}

            <Button
              variant="secondary"
              onClick={closeDialog}
              type="button"
              size="sm"
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-project-form" size="sm">
              {project ? "Submit" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
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

export function CreateButton() {
  const { openDialog } = useEditDialog();

  return (
    <Button className="ml-auto w-fit mt-4" onClick={() => openDialog(null)}>
      Create Project
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
