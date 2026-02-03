"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actionType } from "@/lib/db/schema";

type Type = (typeof actionType)[number];

interface TypeSelectProps {
  value: Type;
  onChange: (value: Type) => void;
  invalid?: boolean;
}

export function TypeSelect({ onChange, value, invalid }: TypeSelectProps) {
  return (
    <Select defaultValue="Nothing" onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full" aria-invalid={invalid}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {actionType.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
