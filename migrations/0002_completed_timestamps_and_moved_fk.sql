ALTER TABLE "actions" ADD COLUMN "completed_new" timestamp with time zone;
--> statement-breakpoint
UPDATE "actions" SET "completed_new" = now() WHERE "completed" = true;
--> statement-breakpoint
ALTER TABLE "actions" DROP COLUMN "completed";
--> statement-breakpoint
ALTER TABLE "actions" RENAME COLUMN "completed_new" TO "completed";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "completed_new" timestamp with time zone;
--> statement-breakpoint
UPDATE "projects" SET "completed_new" = now() WHERE "completed" = true;
--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "completed";
--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "completed_new" TO "completed";
--> statement-breakpoint
ALTER TABLE "ins" ADD COLUMN "moved_new" uuid;
--> statement-breakpoint
WITH chosen_action AS (
  SELECT "id" FROM "actions" ORDER BY random() LIMIT 1
)
UPDATE "ins" SET "moved_new" = (SELECT "id" FROM chosen_action) WHERE "moved" = true;
--> statement-breakpoint
ALTER TABLE "ins" DROP COLUMN "moved";
--> statement-breakpoint
ALTER TABLE "ins" RENAME COLUMN "moved_new" TO "moved";
--> statement-breakpoint
ALTER TABLE "ins" ADD CONSTRAINT "ins_moved_actions_id_fk" FOREIGN KEY ("moved") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;
