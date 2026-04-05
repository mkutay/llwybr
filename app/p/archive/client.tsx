"use client";

import { ArchiveRestore } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { editAction, upsertProject } from "@/lib/actions";
import type { actions, projects } from "@/lib/db/schema";
import { DEFAULT_TIMEOUT_MS, withTimeout } from "@/lib/utils";

type Action = typeof actions.$inferSelect;
type Project = typeof projects.$inferSelect;

export function UnarchiveActionButton({ value }: { value: Action }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnarchive = async () => {
    setIsSubmitting(true);
    try {
      await withTimeout(
        editAction({ ...value, archived: null, tagIds: [] }),
        DEFAULT_TIMEOUT_MS,
      );
      toast.success("Unarchived action.");
    } catch {
      toast.error("Failed to unarchive — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={handleUnarchive}
      disabled={isSubmitting}
    >
      <ArchiveRestore className="size-4" />
      <span className="sr-only">Unarchive</span>
    </Button>
  );
}

export function UnarchiveProjectButton({ value }: { value: Project }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnarchive = async () => {
    setIsSubmitting(true);
    try {
      await withTimeout(
        upsertProject({ ...value, archived: null }),
        DEFAULT_TIMEOUT_MS,
      );
      toast.success("Unarchived project.");
    } catch {
      toast.error("Failed to unarchive — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={handleUnarchive}
      disabled={isSubmitting}
    >
      <ArchiveRestore className="size-4" />
      <span className="sr-only">Unarchive</span>
    </Button>
  );
}
