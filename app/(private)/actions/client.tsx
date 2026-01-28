"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
import { DateTimePicker } from "@/components/date-time-picker";
import { createDialogContext } from "@/components/dialog-context";
import {
  CompletionButton as SharedCompletionButton,
  EditButton as SharedEditButton,
} from "@/components/entity-action-buttons";
import { Button, type buttonVariants } from "@/components/ui/button";
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
import { deleteAction, editAction } from "@/lib/actions";
import type { actions } from "@/lib/db/schema";
import { editActionSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type Action = typeof actions.$inferSelect;

const { Provider: EditDialogProvider, useDialog: useEditDialog } =
  createDialogContext<Action>();

export { EditDialogProvider };

export function EditDialog({
  projects,
  popularProjects,
}: {
  projects: Array<{ id: string; title: string }>;
  popularProjects: Array<{ id: string; title: string }>;
}) {
  const { open, value: action, closeDialog, setOpen } = useEditDialog();

  const form = useForm<z.infer<typeof editActionSchema>>({
    resolver: zodResolver(editActionSchema),
  });

  // Reset form with action values when action changes
  if (action && form.getValues().id !== action.id) {
    form.reset({
      id: action.id,
      title: action.title,
      notes: action.notes,
      deadline: action.deadline,
      projectId: action.projectId,
      completed: action.completed,
    });
  }

  const onSubmit = async (data: z.infer<typeof editActionSchema>) => {
    closeDialog();
    await editAction(data);
    toast.success("Edited.");
  };

  const handleDelete = async () => {
    if (!action) return;
    closeDialog();
    await deleteAction(action.id);
    toast.success("Deleted.");
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Action</DialogTitle>
          <DialogDescription>
            Make changes to the action details and save.
          </DialogDescription>
        </DialogHeader>
        <form id="edit-action-form" onSubmit={form.handleSubmit(onSubmit)}>
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
            <Button type="submit" form="edit-action-form">
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
  variant = "secondary",
}: {
  value: Action;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  const { openDialog } = useEditDialog();

  return (
    <SharedEditButton value={value} onEdit={openDialog} variant={variant} />
  );
}

export function CompletedButton({ value }: { value: Action }) {
  const handleComplete = async (val: Action) => {
    await editAction({ ...val, completed: new Date() });
  };

  return <SharedCompletionButton value={value} onComplete={handleComplete} />;
}

export function Deadline({
  deadline,
  className,
}: {
  deadline: Date;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono whitespace-nowrap",
        new Date() > deadline ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      {format(deadline, "PPp")}
    </div>
  );
}
