"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addIn } from "@/lib/actions";
import { DEFAULT_TIMEOUT_MS, withTimeout } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AddIn() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!text.trim() || isSubmitting) return;
    const prev = text;
    setIsSubmitting(true);
    try {
      await withTimeout(addIn(text), DEFAULT_TIMEOUT_MS);
      setText("");
      toast.success("Added!");
    } catch {
      setText(prev);
      toast.error("Failed to add — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-row gap-2">
      <Input
        placeholder="Add..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAdd();
          }
        }}
      />
      <Button onClick={handleAdd} disabled={isSubmitting}>
        Add
      </Button>
    </div>
  );
}
