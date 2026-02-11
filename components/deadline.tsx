import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function Deadline({
  deadline,
  className,
}: {
  deadline: Date;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono whitespace-nowrap",
        new Date() > deadline ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      {format(deadline, "PPp")}
    </div>
  );
}
