"use client";

import { useState } from "react";
import { actionType } from "@/lib/db/schema";
import { Button } from "./ui/button";

type Type = (typeof actionType)[number];

interface TypeSelectProps {
  value: Type;
  onChange: (value: Type) => void;
  invalid?: boolean;
}

export function TypeSelect({ onChange, value, invalid }: TypeSelectProps) {
  const [selectedType, setSelectedType] = useState<Type>(value);

  return (
    <div className="flex flex-row *:flex-1 flex-wrap gap-2">
      {actionType.map((type) => (
        <Button
          type="button"
          key={type}
          variant={type === selectedType ? "default" : "secondary"}
          onClick={() => {
            setSelectedType(type);
            onChange(type);
          }}
          size="sm"
          aria-invalid={invalid}
        >
          {type}
        </Button>
      ))}
    </div>
  );
}
