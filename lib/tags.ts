import type { tags } from "@/lib/db/schema";

export const getTagsString = (
  tagIds: string[],
  allTags: Array<typeof tags.$inferSelect>,
) => {
  const tagNames = tagIds
    .map((id) => allTags.find((tag) => tag.id === id)?.name)
    .filter((name): name is string => !!name)
    .map((name) => `@${name}`);
  return tagNames.join(" ");
};
