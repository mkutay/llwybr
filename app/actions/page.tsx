import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { actions } from "@/lib/db/schema";
import { EditButton, EditDialog, EditDialogProvider } from "./client";

export default async function InsPage() {
  const data = await db
    .select()
    .from(actions)
    .where(eq(actions.completed, false))
    .orderBy(asc(actions.deadline));

  return (
    <EditDialogProvider>
      <EditDialog />
      <div className="divide-y divide-border flex flex-col py-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="py-2 flex flex-row justify-between items-center"
          >
            {item.title}
            <EditButton value={item} />
          </div>
        ))}
      </div>
    </EditDialogProvider>
  );
}
