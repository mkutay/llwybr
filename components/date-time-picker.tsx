import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  error?: { message?: string };
  invalid?: boolean;
}

function convertTime(t: Date) {
  const hours = t.getHours().toString().padStart(2, "0");
  const minutes = t.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  error,
  invalid,
}: DateTimePickerProps) {
  const [date, setDate] = useState(value?.toLocaleDateString() ?? "");
  const [time, setTime] = useState(value ? convertTime(value) : "");
  const [open, setOpen] = useState(false);

  const updateDateTime = (newDate?: string, newTime?: string) => {
    const datePart = newDate ?? date;
    const timePart = newTime ?? time;
    console.log({ datePart, timePart });
    if (datePart && timePart) {
      onChange(new Date(`${datePart} ${timePart}`));
    } else if (datePart) {
      onChange(new Date(datePart));
    } else if (timePart) {
      const today = new Date();
      const [hours, minutes] = timePart.split(":").map(Number);
      today.setHours(hours, minutes, 0, 0);
      onChange(today);
    } else {
      onChange(null);
    }
  };

  return (
    <Field data-invalid={invalid} className="flex-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-between font-normal flex-1"
            >
              {date ? new Date(date).toLocaleDateString() : "Select date"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(date)}
              captionLayout="dropdown"
              onSelect={(selectedDate) => {
                const dateString = selectedDate?.toDateString() ?? "";
                setDate(dateString);
                updateDateTime(dateString);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
            updateDateTime(undefined, e.target.value);
          }}
          className="w-fit font-mono bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>
      {invalid && error && <FieldError errors={[error]} />}
    </Field>
  );
}
