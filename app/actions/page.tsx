import { asc, eq } from "drizzle-orm";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/drizzle";
import { actions } from "@/lib/db/schema";

export default async function InsPage() {
  const data = await db
    .select()
    .from(actions)
    .where(eq(actions.completed, false))
    .orderBy(asc(actions.deadline));

  return (
    <div className="divide-y divide-border flex flex-col py-4">
      {data.map((item) => (
        <div
          key={item.id}
          className="py-2 flex flex-row justify-between items-center"
        >
          {item.title}
          <Button size="icon-sm" variant="secondary">
            <Ellipsis />
          </Button>
        </div>
      ))}
    </div>
  );
}
