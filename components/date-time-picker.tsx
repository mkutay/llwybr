import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
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

function dateToIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToDate(iso: string): Date {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function DateTimePicker({
  label,
  value,
  onChange,
  error,
  invalid,
}: DateTimePickerProps) {
  const [date, setDate] = useState(value ? dateToIso(value) : "");
  const [time, setTime] = useState(value ? convertTime(value) : "");
  const [open, setOpen] = useState(false);

  // Sync local state with external value changes
  useEffect(() => {
    if (value) {
      setDate(dateToIso(value));
      setTime(convertTime(value));
    } else {
      setDate("");
      setTime("");
    }
  }, [value]);

  const updateDateTime = (newDate: string, newTime: string) => {
    setDate(newDate);
    setTime(newTime);

    if (newDate === "" && newTime === "") {
      onChange(null);
      return;
    }

    const datePart = newDate !== "" ? newDate : date;
    const timePart = newTime !== "" ? newTime : time;

    if (datePart && timePart) {
      const d = isoToDate(datePart);
      const [hours, minutes] = timePart.split(":").map(Number);
      d.setHours(hours, minutes, 0, 0);
      onChange(d);
    } else if (datePart) {
      onChange(isoToDate(datePart));
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
                {date ? isoToDate(date).toLocaleDateString() : "Select date"}
                <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date ? isoToDate(date) : undefined}
                captionLayout="dropdown"
                weekStartsOn={1}
                onSelect={(selectedDate) => {
                  updateDateTime(
                    selectedDate ? dateToIso(selectedDate) : "",
                    time,
                  );
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={time}
            onChange={(e) => {
              updateDateTime(date, e.target.value);
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
            size="xs"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              const now = new Date();
              const dateString = dateToIso(now);
              now.setHours(23, 59, 0, 0);
              const timeString = convertTime(now);
              updateDateTime(dateString, timeString);
            }}
          >
            Tonight
          </Button>
          <Button
            size="xs"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const dateString = dateToIso(tomorrow);
              tomorrow.setHours(23, 59, 0, 0);
              const timeString = convertTime(tomorrow);
              updateDateTime(dateString, timeString);
            }}
          >
            Tomorrow
          </Button>
          <Button
            size="xs"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              const dateString = dateToIso(nextWeek);
              nextWeek.setHours(23, 59, 0, 0);
              const timeString = convertTime(nextWeek);
              updateDateTime(dateString, timeString);
            }}
          >
            Next Week
          </Button>
          <Button
            size="xs"
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => {
              // makes it sunday night
              const thisWeekend = new Date();
              const daysUntilSunday = 7 - thisWeekend.getDay();
              thisWeekend.setDate(thisWeekend.getDate() + daysUntilSunday);
              const dateString = dateToIso(thisWeekend);
              thisWeekend.setHours(23, 59, 0, 0);
              const timeString = convertTime(thisWeekend);
              updateDateTime(dateString, timeString);
            }}
          >
            This Weekend
          </Button>
          {/* <Button
            size="xs"
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
          </Button> */}
        </div>
      </div>
      {invalid && error && <FieldError errors={[error]} />}
    </Field>
  );
}
