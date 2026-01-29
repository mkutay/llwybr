"use client";

import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { Circle, CircleCheck, Ellipsis } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompletionButtonProps<TValue> {
  value: TValue;
  onComplete: (value: TValue) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function CompletionButton<TValue>({
  value,
  onComplete,
  className,
  disabled = false,
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
      disabled={disabled}
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
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function EditButton<TValue>({
  value,
  onEdit,
  className,
  variant = "secondary",
}: EditButtonProps<TValue>) {
  return (
    <Button
      size="icon-sm"
      variant={variant}
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
