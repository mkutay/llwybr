import { asc, eq } from "drizzle-orm";
import { BringToFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/drizzle";
import { ins } from "@/lib/db/schema";

export default async function InsPage() {
  const data = await db
    .select()
    .from(ins)
    .where(eq(ins.moved, false))
    .orderBy(asc(ins.createdAt));

  return (
    <div className="divide-y divide-border flex flex-col py-4">
      {data.map((item) => (
        <div key={item.id} className="py-2 flex flex-row justify-between items-center">
          {item.text}
          <Button size="icon-sm" variant="secondary">
            <BringToFront />
          </Button>
        </div>
      ))}
    </div>
  );
}
