"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Circle, CircleCheck, Ellipsis } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { ChooseProject } from "@/components/choose-project";
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

type EditDialogContextT = {
  open: boolean;
  openDialog: (value: Project) => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
} & {
  value: Project | null;
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
  const [value, setValue] = useState<Project | null>(null);

  const openDialog = (newValue: Project) => {
    setValue(newValue);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <EditDialogContext.Provider
      value={{
        open,
        value,
        openDialog,
        closeDialog,
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
  const { open, value: action, closeDialog, setOpen } = useEditDialog();

  const form = useForm<z.infer<typeof editProjectSchema>>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      id: "",
      title: "",
      notes: "",
      parentProjectId: null,
      completed: null,
    },
  });

  if (action) {
    form.setValue("id", action.id);
    form.setValue("title", action.title);
    form.setValue("notes", action.notes);
    form.setValue("completed", action.completed);
    form.setValue("parentProjectId", action.parentProjectId);
  }

  const onSubmit = async (data: z.infer<typeof editProjectSchema>) => {
    closeDialog();
    await editProject(data);
    toast.success("Edited.");
  };

  const handleDelete = async () => {
    if (!action) return;
    closeDialog();
    await deleteProject(action.id);
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
                    projects={projects.filter((p) => p.id !== action?.id)}
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
    <Button
      size="icon-sm"
      variant="secondary"
      onClick={() => openDialog(value)}
      className={className}
    >
      <Ellipsis />
    </Button>
  );
}

export function CompletedButton({ value }: { value: Project }) {
  const handleComplete = async () => {
    await editProject({ ...value, completed: new Date() });
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
