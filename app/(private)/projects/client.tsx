"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
import { createDialogContext } from "@/components/dialog-context";
import {
  CompletionButton as SharedCompletionButton,
  EditButton as SharedEditButton,
} from "@/components/entity-action-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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

type Project = typeof projects.$inferSelect;

const { Provider: EditDialogProvider, useDialog: useEditDialog } =
  createDialogContext<Project | null>();

export { EditDialogProvider };

export function EditDialog({
  projects,
}: {
  projects: Array<{ id: string; title: string }>;
}) {
  const { open, value: project, closeDialog, setOpen } = useEditDialog();

  const form = useForm<z.infer<typeof upsertProjectSchema>>({
    resolver: zodResolver(upsertProjectSchema),
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
    });
  } else if (project === null && form.getValues().id !== undefined) {
    // Create mode: reset to empty values
    form.reset({
      id: undefined,
      title: "",
      notes: "",
      completed: null,
      parentProjectId: null,
    });
  }

  const onSubmit = async (data: z.infer<typeof upsertProjectSchema>) => {
    closeDialog();
    await upsertProject(data);
    toast.success(project ? "Edited." : "Project created successfully");
  };

  const handleDelete = async () => {
    if (!project) return;
    closeDialog();
    await deleteProject(project.id);
    toast.success("Deleted.");
    form.reset();
  };

  return (
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
        <DialogFooter className="sm:justify-between">
          {project && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div className="flex md:flex-row flex-col gap-2">
            <Button variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" form="edit-project-form">
              {project ? "Submit" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <SharedEditButton value={value} onEdit={openDialog} className={className} />
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

export function CompletedButton({ value }: { value: Project }) {
  const handleComplete = async (val: Project) => {
    await upsertProject({ ...val, completed: new Date() });
  };

  return <SharedCompletionButton value={value} onComplete={handleComplete} />;
}
