"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addIn } from "@/lib/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AddIn() {
  const [text, setText] = useState("");

  const handleAdd = async () => {
    setText("");
    await addIn(text);
    toast.success("Added!");
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
      <Button onClick={handleAdd}>Add</Button>
    </div>
  );
}
