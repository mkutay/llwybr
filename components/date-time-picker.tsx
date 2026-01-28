import { ChevronDown, X } from "lucide-react";
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
    setDate(newDate ?? "");
    setTime(newTime ?? "");
    const datePart = newDate ?? date;
    const timePart = newTime ?? time;
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-between font-normal flex-1 font-mono"
              >
                {date ? new Date(date).toLocaleDateString() : "Select date"}
                <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={new Date(date)}
                captionLayout="dropdown"
                weekStartsOn={1}
                onSelect={(selectedDate) => {
                  updateDateTime(selectedDate?.toDateString() ?? "");
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={time}
            onChange={(e) => {
              updateDateTime(undefined, e.target.value);
            }}
            className="w-fit font-mono bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
          <Button
            onClick={() => {
              updateDateTime("", "");
            }}
            variant="outline"
            size="icon"
            type="button"
          >
            <X />
          </Button>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              const now = new Date();
              const dateString = now.toDateString();
              now.setHours(23);
              now.setMinutes(59);
              const timeString = convertTime(now);
              updateDateTime(dateString, timeString);
            }}
          >
            Tonight
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const dateString = tomorrow.toDateString();
              tomorrow.setHours(23);
              tomorrow.setMinutes(59);
              const timeString = convertTime(tomorrow);
              updateDateTime(dateString, timeString);
            }}
          >
            Tomorrow
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              const dateString = nextWeek.toDateString();
              nextWeek.setHours(23);
              nextWeek.setMinutes(59);
              const timeString = convertTime(nextWeek);
              updateDateTime(dateString, timeString);
            }}
          >
            Next Week
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              // makes it sunday night
              const thisWeekend = new Date();
              const daysUntilSunday = 7 - thisWeekend.getDay();
              thisWeekend.setDate(thisWeekend.getDate() + daysUntilSunday);
              const dateString = thisWeekend.toDateString();
              thisWeekend.setHours(23);
              thisWeekend.setMinutes(59);
              const timeString = convertTime(thisWeekend);
              updateDateTime(dateString, timeString);
            }}
          >
            This Weekend
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              const inTwoWeeks = new Date();
              inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
              const dateString = inTwoWeeks.toDateString();
              inTwoWeeks.setHours(23);
              inTwoWeeks.setMinutes(59);
              const timeString = convertTime(inTwoWeeks);
              updateDateTime(dateString, timeString);
            }}
          >
            In Two Weeks
          </Button>
        </div>
      </div>
      {invalid && error && <FieldError errors={[error]} />}
    </Field>
  );
}
