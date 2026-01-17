import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
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
import { Button } from "./ui/button";

export function ChooseProject({
  projects,
  onChange,
  value,
}: {
  projects: Array<{ id: string; title: string }>;
  onChange: (projectId: string) => void;
  value: string | null;
}) {
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <DropdownMenu open={projectsOpen} onOpenChange={setProjectsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={projectsOpen}
          className="w-full justify-between"
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
  );
}
