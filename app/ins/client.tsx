"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { BringToFront } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { DateTimePicker } from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { moveInAction } from "@/lib/actions";
import { moveInSchema } from "@/lib/schemas";

interface MoveDialogContext {
  open: boolean;
  id: string;
  text: string;
  openDialog: (id: string, text: string) => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
}

const MoveDialogContext = createContext<MoveDialogContext | undefined>(
  undefined,
);

export function MoveDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [text, setText] = useState("");

  const openDialog = (newId: string, newText: string) => {
    setId(newId);
    setText(newText);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setId("");
    setText("");
  };

  return (
    <MoveDialogContext.Provider
      value={{
        open,
        id,
        text,
        openDialog,
        closeDialog,
        setOpen,
      }}
    >
      {children}
    </MoveDialogContext.Provider>
  );
}

function useMoveDialog() {
  const context = useContext(MoveDialogContext);

  if (context === undefined) {
    throw new Error("useMoveDialog must be used within a MoveDialogProvider");
  }

  return context;
}

export function MoveDialog() {
  const { open, id, text, closeDialog, setOpen } = useMoveDialog();

  const form = useForm<z.infer<typeof moveInSchema>>({
    resolver: zodResolver(moveInSchema),
    defaultValues: {
      inId: "",
      title: "",
      description: "",
      notes: "",
      deadline: undefined,
    },
  });

  form.setValue("inId", id);
  form.setValue("title", text);
  form.setValue("notes", text);

  const onSubmit = async (data: z.infer<typeof moveInSchema>) => {
    closeDialog();
    await moveInAction(data);
    toast.success("Moved to actions.");
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
                  onChange={field.onChange}
                  error={fieldState.error}
                  invalid={fieldState.invalid}
                />
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="secondary" onClick={closeDialog}>
            Cancel
          </Button>
          <Button type="submit" form="move-in-form">
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MoveButton({ id, text }: { id: string; text: string }) {
  const { openDialog } = useMoveDialog();

  return (
    <Button
      size="icon-sm"
      variant="secondary"
      onClick={() => openDialog(id, text)}
    >
      <BringToFront />
    </Button>
  );
}
