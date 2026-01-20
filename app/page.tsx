import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function Home() {
  const acs = await db
    .select()
    .from(actions)
    .where(eq(actions.completed, false));

  const completed = await db
    .select()
    .from(actions)
    .where(eq(actions.completed, true));

  const prjs = await db
    .select()
    .from(projects)
    .where(eq(projects.completed, false));

  return (
    <div className="flex flex-col gap-2 justify-center items-center min-h-screen font-mono">
      <p className="text-lg leading-relaxed">
        waiting to be done: {acs.length}
      </p>
      <p className="text-lg leading-relaxed">active projects: {prjs.length}</p>
      <p className="text-lg leading-relaxed">
        completed actions: {completed.length}
      </p>
    </div>
  );
}
