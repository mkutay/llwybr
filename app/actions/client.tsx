"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Circle, CircleCheck, Ellipsis } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
import { DateTimePicker } from "@/components/date-time-picker";
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
import { editAction } from "@/lib/actions";
import type { actions } from "@/lib/db/schema";
import { editActionSchema } from "@/lib/schemas";

type Action = typeof actions.$inferSelect;

type EditDialogContextT = {
  open: boolean;
  openDialog: (value: Action) => void;
  setOpen: (open: boolean) => void;
} & {
  value: Action | null;
};

const EditDialogContext = createContext<EditDialogContextT | undefined>(
  undefined,
);

export function EditDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Action | null>(null);

  const openDialog = (newValue: Action) => {
    setValue(newValue);
    setOpen(true);
  };

  return (
    <EditDialogContext.Provider
      value={{
        open,
        value,
        openDialog,
        setOpen,
      }}
    >
      {children}
    </EditDialogContext.Provider>
  );
}

function useEditDialog() {
  const context = useContext(EditDialogContext);

  if (context === undefined) {
    throw new Error("useEditDialog must be used within a EditDialogProvider");
  }

  return context;
}

export function EditDialog({
  projects,
}: {
  projects: Array<{ id: string; title: string }>;
}) {
  const { open, value: action, setOpen } = useEditDialog();

  const form = useForm<z.infer<typeof editActionSchema>>({
    resolver: zodResolver(editActionSchema),
    defaultValues: {
      id: "",
      title: "",
      description: "",
      notes: "",
      deadline: null,
      projectId: null,
      completed: false,
    },
  });

  if (action) {
    form.setValue("id", action.id);
    form.setValue("title", action.title);
    form.setValue("description", action.description);
    form.setValue("notes", action.notes);
    form.setValue("deadline", action.deadline);
    form.setValue("projectId", action.projectId);
    form.setValue("completed", action.completed);
  }

  const onSubmit = async (data: z.infer<typeof editActionSchema>) => {
    setOpen(false);
    await editAction(data);
    toast.success("Edited.");
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
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Description</FieldLabel>
                  <Input
                    {...field}
                    id="description"
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
                  onChange={(e) => {
                    console.log(e);
                    field.onChange(e);
                  }}
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
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-action-form">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditButton({ value }: { value: Action }) {
  const { openDialog } = useEditDialog();

  return (
    <Button
      size="icon-sm"
      variant="secondary"
      onClick={() => openDialog(value)}
    >
      <Ellipsis />
    </Button>
  );
}

export function CompletedButton({ value }: { value: Action }) {
  const handleComplete = async () => {
    await editAction({ ...value, completed: true });
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={() => handleComplete()}
      className="group"
    >
      <Circle className="group-hover:hidden flex" />
      <CircleCheck className="hidden group-hover:flex" />
    </Button>
  );
}
