import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DateTimePickerProps {
  label: string;
  value?: Date;
  onChange: (value: Date) => void;
  error?: { message?: string };
  invalid?: boolean;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  error,
  invalid,
}: DateTimePickerProps) {
  const dateTime = value ? new Date(value) : undefined;
  const [date, setDate] = useState<Date | undefined>(dateTime);
  const [time, setTime] = useState(dateTime ? dateTime.toTimeString() : "21:00");
  const [open, setOpen] = useState(false);

  const updateDateTime = (newDate?: Date, newTime?: string) => {
    const d = newDate || date;
    const t = newTime !== undefined ? newTime : time;
    if (d && t) {
      const [hours, minutes] = t.split(":");
      if (hours && minutes) {
        const updatedDate = new Date(d);
        updatedDate.setHours(
          Number.parseInt(hours, 10),
          Number.parseInt(minutes, 10),
        );
        onChange(updatedDate);
      }
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
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                updateDateTime(selectedDate);
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
