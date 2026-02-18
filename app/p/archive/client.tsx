"use client";

import { ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { editAction, upsertProject } from "@/lib/actions";
import type { actions, projects } from "@/lib/db/schema";

type Action = typeof actions.$inferSelect;
type Project = typeof projects.$inferSelect;

export function UnarchiveActionButton({ value }: { value: Action }) {
  const handleUnarchive = async () => {
    await editAction({ ...value, archived: null });
    toast.success("Unarchived action.");
  };

  return (
    <Button variant="outline" size="icon-sm" onClick={handleUnarchive}>
      <ArchiveRestore className="size-4" />
      <span className="sr-only">Unarchive</span>
    </Button>
  );
}

export function UnarchiveProjectButton({ value }: { value: Project }) {
  const handleUnarchive = async () => {
    await upsertProject({ ...value, archived: null });
    toast.success("Unarchived project.");
  };

  return (
    <Button variant="outline" size="icon-sm" onClick={handleUnarchive}>
      <ArchiveRestore className="size-4" />
      <span className="sr-only">Unarchive</span>
    </Button>
  );
}
