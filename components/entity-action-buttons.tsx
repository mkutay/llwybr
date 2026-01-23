"use client";

import type { LucideIcon } from "lucide-react";
import { Circle, CircleCheck, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompletionButtonProps<TValue> {
  value: TValue;
  onComplete: (value: TValue) => Promise<void>;
  className?: string;
}

export function CompletionButton<TValue>({
  value,
  onComplete,
  className,
}: CompletionButtonProps<TValue>) {
  const handleComplete = async () => {
    await onComplete(value);
  };

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={handleComplete}
      className={cn("group", className)}
    >
      <Circle className="group-hover:hidden flex" />
      <CircleCheck className="hidden group-hover:flex" />
    </Button>
  );
}

interface EditButtonProps<TValue> {
  value: TValue;
  onEdit: (value: TValue) => void;
  className?: string;
}

export function EditButton<TValue>({
  value,
  onEdit,
  className,
}: EditButtonProps<TValue>) {
  return (
    <Button
      size="icon-sm"
      variant="secondary"
      onClick={() => onEdit(value)}
      className={className}
    >
      <Ellipsis />
    </Button>
  );
}

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: "ghost" | "secondary" | "outline" | "default" | "destructive";
  className?: string;
}

export function ActionButton({
  icon: Icon,
  onClick,
  variant = "secondary",
  className,
}: ActionButtonProps) {
  return (
    <Button
      size="icon-sm"
      variant={variant}
      onClick={onClick}
      className={className}
    >
      <Icon />
    </Button>
  );
}
