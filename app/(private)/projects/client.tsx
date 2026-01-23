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
import { deleteProject, editProject } from "@/lib/actions";
import type { projects } from "@/lib/db/schema";
import { editProjectSchema } from "@/lib/schemas";

type Project = typeof projects.$inferSelect;

const { Provider: EditDialogProvider, useDialog: useEditDialog } =
  createDialogContext<Project>();

export { EditDialogProvider };

export function EditDialog({
  projects,
}: {
  projects: Array<{ id: string; title: string }>;
}) {
  const { open, value: project, closeDialog, setOpen } = useEditDialog();

  const form = useForm<z.infer<typeof editProjectSchema>>({
    resolver: zodResolver(editProjectSchema),
  });

  // Reset form with project values when project changes
  if (project && form.getValues().id !== project.id) {
    form.reset({
      id: project.id,
      title: project.title,
      notes: project.notes,
      completed: project.completed,
      parentProjectId: project.parentProjectId,
    });
  }

  const onSubmit = async (data: z.infer<typeof editProjectSchema>) => {
    closeDialog();
    await editProject(data);
    toast.success("Edited.");
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
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to the project details and save.
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
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex md:flex-row flex-col gap-2">
            <Button variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" form="edit-project-form">
              Submit
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

export function CompletedButton({ value }: { value: Project }) {
  const handleComplete = async (val: Project) => {
    await editProject({ ...val, completed: new Date() });
  };

  return <SharedCompletionButton value={value} onComplete={handleComplete} />;
}
