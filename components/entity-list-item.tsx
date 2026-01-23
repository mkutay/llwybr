import { cn } from "@/lib/utils";

interface EntityListItemProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

export function EntityListItem({
  leading,
  title,
  description,
  trailing,
  className,
}: EntityListItemProps) {
  return (
    <div
      className={cn(
        "py-2 flex flex-row flex-wrap gap-1 justify-between items-end",
        className,
      )}
    >
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          {leading}
          {title}
        </div>
        {description}
      </div>
      {trailing && (
        <div className="flex flex-row gap-4 items-center ml-auto">
          {trailing}
        </div>
      )}
    </div>
  );
}
