import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncate } from "@/lib/utils";
import { Button } from "./ui/button";

export function ChooseProject({
  projects,
  popularProjects,
  onChange,
  value,
}: {
  projects: Array<{ id: string; title: string }>;
  popularProjects: Array<{ id: string; title: string }>;
  onChange: (projectId: string | null) => void;
  value: string | null;
}) {
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 flex-1">
        <DropdownMenu open={projectsOpen} onOpenChange={setProjectsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={projectsOpen}
              className="flex-1 justify-between"
            >
              {value
                ? projects.find((p) => p.id === value)?.title
                : "Select project..."}
              <ChevronsUpDownIcon className="shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search projects..." />
              <CommandList>
                <CommandEmpty>No location found.</CommandEmpty>
                <CommandGroup>
                  {projects.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.title}
                      onSelect={() => {
                        onChange(p.id);
                        setProjectsOpen(false);
                      }}
                      className="relative"
                    >
                      <CheckIcon
                        className={p.id === value ? "opacity-100" : "opacity-0"}
                      />
                      {p.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={() => onChange(null)}
          variant="outline"
          size="icon"
          type="button"
        >
          <X />
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {popularProjects.map((p) => (
          <Button
            key={p.id}
            variant="outline"
            size="xs"
            onClick={() => onChange(p.id)}
            className="flex-1"
            type="button"
          >
            {truncate(p.title, 27)}
          </Button>
        ))}
      </div>
    </div>
  );
}
