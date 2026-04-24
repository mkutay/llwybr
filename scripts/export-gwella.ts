import fs from "node:fs";
import path from "node:path";
import { and, asc, desc, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, actionTags, projects, tags } from "@/lib/db/schema";

const DIRECTORY = "export/gwella";

// Ensure output directory exists
fs.mkdirSync(DIRECTORY, { recursive: true });

// Reference data
const allTags = await db.select().from(tags);
const allActionTags = await db.select().from(actionTags);
const allProjects = await db.select().from(projects);

/** Returns the tag names attached to an action. */
function tagNamesForAction(actionId: string): string[] {
  return allActionTags
    .filter((at) => at.actionId === actionId)
    .map((at) => allTags.find((t) => t.id === at.tagId)?.name)
    .filter((n): n is string => Boolean(n));
}

/** Returns the project title for a given id, or undefined. */
function projectTitle(projectId: string | null): string | undefined {
  if (!projectId) return undefined;
  return allProjects.find((p) => p.id === projectId)?.title;
}

/** Formats a Date as an ISO 8601 UTC string truncated to the minute. */
function fmtDate(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Strips characters that are illegal in most filesystems so that the
 * wikilink target and the filename on disk are always identical.
 */
function sanitiseTitle(title: string): string {
  return title.replace(/[/\\?%*:|"<>]/g, "");
}

/**
 * Renders a single action to the Gwella task-list syntax:
 *
 * - [ ] title [[project]] #tag1 #tag2 #status 2026-04-23T20:00Z (completed: ...) (archived: ...)
 *  extra notes
 */
function renderAction(action: typeof actions.$inferSelect): string {
  const checkbox = action.completed ? "[x]" : "[ ]";

  const parts: string[] = [action.title.trim()];

  // Linked project as wikilink
  const pTitle = projectTitle(action.projectId);
  if (pTitle) parts.push(`[[${sanitiseTitle(pTitle)}]]`);

  // Context / status tags from the tags table
  const tagNames = tagNamesForAction(action.id);
  for (const name of tagNames) {
    parts.push(`#${name}`);
  }

  // Action type -> status tag
  if (action.type === "Now") parts.push("#now");
  else if (action.type === "Waiting For") parts.push("#waiting-for");

  // Optional deadline / scheduled timestamp
  if (action.deadline) parts.push(fmtDate(action.deadline));

  // Completion/archival metadata appended in parentheses
  if (action.completed) parts.push(`(completed: ${fmtDate(action.completed)})`);
  if (action.archived) parts.push(`(archived: ${fmtDate(action.archived)})`);

  let line = `- ${checkbox} ${parts.join(" ")}\n`;

  // Notes indented with 2 spaces (to align under the title after "- [ ] ")
  if (action.notes.trim()) {
    const indented = action.notes
      .trim()
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n");
    line += `${indented}\n`;
  }

  return line;
}

// 1. Project notes — one file per active (non-completed, non-archived) project
const activeProjects = allProjects.filter((p) => !p.completed && !p.archived);
const completedProjects = allProjects.filter((p) => p.completed);
const archivedProjects = allProjects.filter((p) => p.archived && !p.completed);

/** Renders a project note file following the Gwella spec. */
function renderProjectNote(project: typeof projects.$inferSelect): string {
  const fm: string[] = ["---"];
  fm.push(`created: ${fmtDate(project.createdAt)}`);
  if (project.completed) fm.push(`completed: ${fmtDate(project.completed)}`);
  if (project.archived) fm.push(`archived: ${fmtDate(project.archived)}`);
  fm.push("tags:");
  fm.push("    - project");
  fm.push("---");

  const lines: string[] = [fm.join("\n"), "", `# ${project.title}`, ""];

  // Related projects: backlink to parent and any projects that list this as parent
  const related: string[] = [];
  if (project.parentProjectId) {
    const parent = projectTitle(project.parentProjectId);
    if (parent) related.push(parent);
  }
  // Siblings / children that reference this project as parent
  const children = allProjects.filter(
    (p) => p.parentProjectId === project.id && p.id !== project.id,
  );
  for (const child of children) {
    if (!related.includes(child.title)) related.push(child.title);
  }

  if (related.length > 0) {
    lines.push("Related projects:", "");
    for (const r of related) {
      lines.push(`- [[${sanitiseTitle(r)}]]`);
    }
    lines.push("");
  }

  if (project.notes.trim()) {
    lines.push(project.notes.trim(), "");
  }

  return lines.join("\n");
}

// Write one .md file per active project
for (const p of activeProjects) {
  const filename = `${sanitiseTitle(p.title)}.md`;
  fs.writeFileSync(path.join(DIRECTORY, filename), renderProjectNote(p));
}

console.log(`Wrote ${activeProjects.length} active project note(s).`);

// 2. actions.md — active (non-completed, non-archived) actions
const activeActions = await db
  .select()
  .from(actions)
  .where(and(isNull(actions.completed), isNull(actions.archived)))
  .orderBy(asc(actions.deadline), asc(actions.createdAt));

let actionsMd = "";
for (const a of activeActions) {
  actionsMd += renderAction(a);
}

fs.writeFileSync(path.join(DIRECTORY, "actions.md"), actionsMd);
console.log(`Wrote actions.md (${activeActions.length} action(s)).`);

// 3. completed.md — completed actions + completed project notes
const completedActions = await db
  .select()
  .from(actions)
  .where(isNotNull(actions.completed))
  .orderBy(desc(actions.completed));

let completedMd = "";
for (const a of completedActions) {
  completedMd += renderAction(a);
}

fs.writeFileSync(path.join(DIRECTORY, "completed.md"), completedMd);
console.log(`Wrote completed.md (${completedActions.length} action(s)).`);

// Write completed project notes as individual files too
for (const p of completedProjects) {
  const filename = `${sanitiseTitle(p.title)}.md`;
  fs.writeFileSync(path.join(DIRECTORY, filename), renderProjectNote(p));
}
console.log(`Wrote ${completedProjects.length} completed project note(s).`);

// 4. archived.md — archived (non-completed) actions + archived project notes
const archivedActions = await db
  .select()
  .from(actions)
  .where(and(isNotNull(actions.archived), isNull(actions.completed)))
  .orderBy(
    asc(actions.deadline),
    asc(actions.createdAt),
    asc(actions.archived),
  );

let archivedMd = "";
for (const a of archivedActions) {
  archivedMd += renderAction(a);
}

fs.writeFileSync(path.join(DIRECTORY, "archived.md"), archivedMd);
console.log(`Wrote archived.md (${archivedActions.length} action(s)).`);

// Write archived project notes as individual files
for (const p of archivedProjects) {
  const filename = `${sanitiseTitle(p.title)}.md`;
  fs.writeFileSync(path.join(DIRECTORY, filename), renderProjectNote(p));
}
console.log(`Wrote ${archivedProjects.length} archived project note(s).`);

console.log(`\nAll files written to ./${DIRECTORY}/`);
process.exit(0);
