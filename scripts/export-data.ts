import fs from "node:fs";
import { and, asc, desc, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, actionTags, ins, projects, tags } from "@/lib/db/schema";

const DIRECTORY = "export";

// Fetch reference data
const allTags = await db.select().from(tags);
const allActionTags = await db.select().from(actionTags);
const getActionTags = (actionId: string) => {
  const at = allActionTags.filter((a) => a.actionId === actionId);
  return at
    .map((a) => allTags.find((t) => t.id === a.tagId)?.name)
    .filter(Boolean)
    .join(", ");
};

const dbProjects = await db.select().from(projects);

// 1. INS
let insMd = "# Ins\n\n";
const insData = await db
  .select()
  .from(ins)
  .where(isNull(ins.moved))
  .orderBy(asc(ins.createdAt));
if (insData.length === 0) insMd += "*No items*\n";
for (const item of insData) {
  insMd += `- ${item.text}\n`;
}
fs.writeFileSync(`${DIRECTORY}/ins.md`, insMd);

// 2. PROJECTS
let projectsMd = "# Projects\n\n";
const projectsData = await db
  .select()
  .from(projects)
  .where(and(isNull(projects.completed), isNull(projects.archived)))
  .orderBy(asc(projects.createdAt));

const activeActions = await db
  .select()
  .from(actions)
  .where(and(isNull(actions.completed), isNull(actions.archived)));

if (projectsData.length === 0) projectsMd += "*No projects*\n";
for (const p of projectsData) {
  projectsMd += `## ${p.title}\n\n`;
  if (p.notes) {
    projectsMd += `${p.notes}\n\n`;
  }
  const pActions = activeActions.filter((a) => a.projectId === p.id);
  for (const a of pActions) {
    const ts = getActionTags(a.id);
    const parts = [];
    if (a.type !== "Nothing") parts.push(`[${a.type.toUpperCase()}]`);
    if (ts) parts.push(`[${ts}]`);
    if (a.deadline) parts.push(`(${a.deadline.toISOString()})`);
    if (a.completed) parts.push(`(${a.completed.toISOString()})`);

    const prefix = parts.length > 0 ? `${parts.join(" ")} ` : "";
    projectsMd += `- ${prefix}${a.title}\n`;
    if (a.notes) {
      const indentedNotes = a.notes
        .split("\n")
        .map((l) => `  ${l}`)
        .join("\n");
      projectsMd += `${indentedNotes}\n`;
    }
  }
  projectsMd += "\n";
}
fs.writeFileSync(`${DIRECTORY}/projects.md`, projectsMd);

// 3. ACTIONS
let actionsMd = "# Actions\n\n";
const actionsData = [...activeActions].sort((a, b) => {
  if (a.deadline && b.deadline)
    return a.deadline.getTime() - b.deadline.getTime();
  if (a.deadline) return -1;
  if (b.deadline) return 1;
  return a.createdAt.getTime() - b.createdAt.getTime();
});
if (actionsData.length === 0) actionsMd += "*No actions*\n";
for (const a of actionsData) {
  const ts = getActionTags(a.id);
  const parts = [];
  if (a.projectId) {
    const p = dbProjects.find((p) => p.id === a.projectId);
    if (p) parts.push(`(${p.title})`);
  }
  if (a.type !== "Nothing") parts.push(`[${a.type.toUpperCase()}]`);
  if (ts) parts.push(`[${ts}]`);
  if (a.deadline) parts.push(`(${a.deadline.toISOString()})`);
  if (a.completed) parts.push(`(${a.completed.toISOString()})`);

  const prefix = parts.length > 0 ? `${parts.join(" ")} ` : "";
  actionsMd += `- ${prefix}${a.title}\n`;
  if (a.notes) {
    const indentedNotes = a.notes
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n");
    actionsMd += `${indentedNotes}\n`;
  }
}
fs.writeFileSync(`${DIRECTORY}/actions.md`, actionsMd);

// 4. ARCHIVED
const archivedProjects = await db
  .select()
  .from(projects)
  .where(isNotNull(projects.archived))
  .orderBy(asc(projects.archived));
const archivedActions = await db
  .select()
  .from(actions)
  .where(isNotNull(actions.archived))
  .orderBy(asc(actions.archived));

let archivedMd = "# Archived\n\n";
archivedMd += "## Actions\n\n";
if (archivedActions.length === 0) archivedMd += "*No archived actions*\n\n";
for (const a of archivedActions) {
  const ts = getActionTags(a.id);
  const parts = [];
  if (a.projectId) {
    const p = dbProjects.find((p) => p.id === a.projectId);
    if (p) parts.push(`(${p.title})`);
  }
  if (a.type !== "Nothing") parts.push(`[${a.type.toUpperCase()}]`);
  if (ts) parts.push(`[${ts}]`);
  if (a.deadline) parts.push(`(${a.deadline.toISOString()})`);
  if (a.completed) parts.push(`(${a.completed.toISOString()})`);

  const prefix = parts.length > 0 ? `${parts.join(" ")} ` : "";
  archivedMd += `- ${prefix}${a.title}\n`;
  if (a.notes) {
    const indentedNotes = a.notes
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n");
    archivedMd += `${indentedNotes}\n`;
  }
}
archivedMd += "\n## Projects\n\n";
if (archivedProjects.length === 0) archivedMd += "*No archived projects*\n\n";
for (const p of archivedProjects) {
  archivedMd += `### ${p.title}\n\n`;
  if (p.notes) {
    archivedMd += `${p.notes}\n\n`;
  }
}
fs.writeFileSync(`${DIRECTORY}/archived.md`, archivedMd);

// 5. COMPLETED
const completedProjects = await db
  .select()
  .from(projects)
  .where(isNotNull(projects.completed))
  .orderBy(desc(projects.completed));
const completedActions = await db
  .select()
  .from(actions)
  .where(isNotNull(actions.completed))
  .orderBy(desc(actions.completed));

let completedMd = "# Completed\n\n";
completedMd += "## Actions\n\n";
if (completedActions.length === 0) completedMd += "*No completed actions*\n\n";
for (const a of completedActions) {
  const ts = getActionTags(a.id);
  const parts = [];
  if (a.projectId) {
    const p = dbProjects.find((p) => p.id === a.projectId);
    if (p) parts.push(`(${p.title})`);
  }
  if (a.type !== "Nothing") parts.push(`[${a.type.toUpperCase()}]`);
  if (ts) parts.push(`[${ts}]`);
  if (a.deadline) parts.push(`(${a.deadline.toISOString()})`);
  if (a.completed) parts.push(`(${a.completed.toISOString()})`);

  const prefix = parts.length > 0 ? `${parts.join(" ")} ` : "";
  completedMd += `- ${prefix}${a.title}\n`;
  if (a.notes) {
    const indentedNotes = a.notes
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n");
    completedMd += `${indentedNotes}\n`;
  }
}
completedMd += "\n## Projects\n\n";
if (completedProjects.length === 0)
  completedMd += "*No completed projects*\n\n";
for (const p of completedProjects) {
  completedMd += `### ${p.title}\n\n`;
  if (p.notes) {
    completedMd += `${p.notes}\n\n`;
  }
}
fs.writeFileSync(`${DIRECTORY}/completed.md`, completedMd);

console.log(
  "Exported data to ins.md, projects.md, actions.md, archived.md, and completed.md!",
);
process.exit(0);
