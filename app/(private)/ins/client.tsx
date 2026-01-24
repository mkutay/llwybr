"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BringToFront } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
import { DateTimePicker } from "@/components/date-time-picker";
import { createDialogContext } from "@/components/dialog-context";
import { ActionButton } from "@/components/entity-action-buttons";
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
import { deleteIn, moveInAction } from "@/lib/actions";
import { moveInSchema } from "@/lib/schemas";

interface InDialogValue {
  id: string;
  text: string;
}

const { Provider: MoveDialogProvider, useDialog: useMoveDialog } =
  createDialogContext<InDialogValue>();

export { MoveDialogProvider };

export function MoveDialog({
  projects,
  popularProjects,
}: {
  projects: Array<{ id: string; title: string }>;
  popularProjects: Array<{ id: string; title: string }>;
}) {
  const { open, value, closeDialog, setOpen } = useMoveDialog();

  const form = useForm<z.infer<typeof moveInSchema>>({
    resolver: zodResolver(moveInSchema),
  });

  // Reset form with value when it changes
  if (value && form.getValues().inId !== value.id) {
    form.reset({
      inId: value.id,
      title: value.text,
      notes: value.text,
      deadline: null,
      projectId: null,
    });
  }

  const onSubmit = async (data: z.infer<typeof moveInSchema>) => {
    closeDialog();
    await moveInAction(data);
    toast.success("Moved to actions.");
    form.reset();
  };

  const handleDelete = async () => {
    if (!value) return;
    closeDialog();
    await deleteIn(value.id);
    toast.success("Deleted.");
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Actions</DialogTitle>
          <DialogDescription>
            Fill in the details to move this In to your Actions.
          </DialogDescription>
        </DialogHeader>
        <form id="move-in-form" onSubmit={form.handleSubmit(onSubmit)}>
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
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex md:flex-row flex-col gap-2">
            <Button variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" form="move-in-form">
              Move
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MoveButton({
  id,
  text,
  className,
}: {
  id: string;
  text: string;
  className?: string;
}) {
  const { openDialog } = useMoveDialog();

  return (
    <ActionButton
      icon={BringToFront}
      onClick={() => openDialog({ id, text })}
      className={className}
    />
  );
}
