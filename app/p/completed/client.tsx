"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { editAction, upsertProject } from "@/lib/actions";
import type { actions, projects } from "@/lib/db/schema";

type Action = typeof actions.$inferSelect;
type Project = typeof projects.$inferSelect;

type PendingItem =
  | { kind: "action"; value: Action }
  | { kind: "project"; value: Project };

const UncompleteContext = createUncompleteContext();

import { createContext, useContext } from "react";

function createUncompleteContext() {
  const Ctx = createContext<{
    requestAction: (action: Action) => void;
    requestProject: (project: Project) => void;
  } | null>(null);
  return Ctx;
}

function useUncomplete() {
  const ctx = useContext(UncompleteContext);
  if (!ctx)
    throw new Error("UncompleteButton must be inside UncompleteDialogProvider");
  return ctx;
}

export function UncompleteDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<PendingItem | null>(null);

  const handleUncomplete = async () => {
    if (!pending) return;
    if (pending.kind === "action") {
      await editAction({ ...pending.value, completed: null });
    } else {
      await upsertProject({ ...pending.value, completed: null });
    }
    toast.success("Marked as incomplete.");
    setPending(null);
  };

  return (
    <UncompleteContext.Provider
      value={{
        requestAction: (action) =>
          setPending({ kind: "action", value: action }),
        requestProject: (project) =>
          setPending({ kind: "project", value: project }),
      }}
    >
      {children}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as incomplete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move &ldquo;{pending?.value.title}&rdquo; back to your
              active
              {pending?.kind === "action" ? " actions" : " projects"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUncomplete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UncompleteContext.Provider>
  );
}

export function UncompleteButton({ value }: { value: Action }) {
  const { requestAction } = useUncomplete();

  return (
    <Button size="icon-sm" variant="ghost" onClick={() => requestAction(value)}>
      <CircleCheck />
    </Button>
  );
}

export function UncompleteProjectButton({ value }: { value: Project }) {
  const { requestProject } = useUncomplete();

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={() => requestProject(value)}
    >
      <CircleCheck />
    </Button>
  );
}
