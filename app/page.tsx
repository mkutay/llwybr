import { endOfDay, startOfDay } from "date-fns";
import { and, gte, isNotNull, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function Home() {
  const acs = await db
    .select()
    .from(actions)
    .where(and(isNull(actions.completed), isNull(actions.archived)));

  const now = new Date();

  const completed = await db
    .select()
    .from(actions)
    .where(isNotNull(actions.completed));

  const completedToday = await db
    .select()
    .from(actions)
    .where(
      and(
        isNotNull(actions.completed),
        gte(actions.completed, startOfDay(now)),
        lt(actions.completed, endOfDay(now)),
      ),
    );

  const prjs = await db
    .select()
    .from(projects)
    .where(isNull(projects.completed));

  return (
    <div className="flex flex-col gap-2 justify-center items-center min-h-screen font-mono">
      <p className="text-lg leading-relaxed">
        waiting to be done: {acs.length}
      </p>
      <p className="text-lg leading-relaxed">active projects: {prjs.length}</p>
      <p className="text-lg leading-relaxed">
        completed actions: {completed.length} (today: {completedToday.length})
      </p>
    </div>
  );
}
