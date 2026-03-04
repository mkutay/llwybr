"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createTag } from "@/lib/actions";
import { Badge } from "./ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Tag {
  id: string;
  name: string;
}

interface ChooseTagsProps {
  /** All available tags from the database */
  allTags: Tag[];
  /** Currently selected tag IDs */
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export function ChooseTags({ allTags, value, onChange }: ChooseTagsProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [localTags, setLocalTags] = useState<Tag[]>(allTags);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const input = document.querySelector(
          '[data-slot="command-input"]',
        ) as HTMLInputElement | null;
        input?.focus();
      }, 0);
    }
  }, [open]);

  const selectedTags = localTags.filter((t) => value.includes(t.id));
  const unselectedTags = localTags.filter((t) => !value.includes(t.id));

  const trimmedSearch = search.trim();
  const matchExact = localTags.some(
    (t) => t.name.toLowerCase() === trimmedSearch.toLowerCase(),
  );
  const showCreate = trimmedSearch.length > 0 && !matchExact;

  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const addTag = (tagId: string) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
    }
    setOpen(false);
    setSearch("");
  };

  const handleCreate = async () => {
    if (!trimmedSearch || creating) return;
    setCreating(true);
    try {
      const newTag = await createTag(trimmedSearch);
      setOpen(false);
      setLocalTags((prev) => [...prev, newTag]);
      onChange([...value, newTag.id]);
      setSearch("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-row flex-wrap gap-1 items-center">
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="group flex items-center relative"
        >
          <span className="group-hover:opacity-0 opacity-100 transition-opacity">
            {tag.name}
          </span>
          <button
            type="button"
            onClick={() => removeTag(tag.id)}
            className="group-hover:opacity-100 opacity-0 absolute inset-0 flex items-center justify-center transition-opacity"
            aria-label={`Remove tag ${tag.name}`}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Badge asChild variant="secondary">
            <button type="button" aria-label="Add tag" className="h-5.5">
              <PlusIcon className="size-3" />
            </button>
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {unselectedTags.length === 0 && !showCreate && (
                <CommandEmpty>No tags found.</CommandEmpty>
              )}
              <CommandGroup>
                {unselectedTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => addTag(tag.id)}
                  >
                    {tag.name}
                  </CommandItem>
                ))}
                {showCreate && (
                  <CommandItem
                    value={`__create__${trimmedSearch}`}
                    onSelect={handleCreate}
                    disabled={creating}
                  >
                    Create &quot;{trimmedSearch}&quot;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
