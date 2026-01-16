import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { ins } from "@/lib/db/schema";
import { MoveButton, MoveDialog, MoveDialogProvider } from "./client";

export default async function InsPage() {
  const data = await db
    .select()
    .from(ins)
    .where(eq(ins.moved, false))
    .orderBy(asc(ins.createdAt));

  return (
    <MoveDialogProvider>
      <MoveDialog />

      <div className="divide-y divide-border flex flex-col">
        {data.map((item) => (
          <div
            key={item.id}
            className="py-2 flex flex-row justify-between items-center"
          >
            {item.text}
            <MoveButton id={item.id} text={item.text} />
          </div>
        ))}
      </div>
    </MoveDialogProvider>
  );
}
