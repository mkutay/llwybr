import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions, projects } from "@/lib/db/schema";

export default async function Home() {
  const acs = await db
    .select()
    .from(actions)
    .where(eq(actions.completed, false));

  const prjs = await db
    .select()
    .from(projects)
    .where(eq(projects.completed, false));

  return (
    <div className="flex flex-col gap-2 justify-center items-center min-h-screen">
      <p className="text-lg leading-relaxed">
        waiting to be done: {acs.length}
      </p>
      <p className="text-lg leading-relaxed">active projects: {prjs.length}</p>
    </div>
  );
}
