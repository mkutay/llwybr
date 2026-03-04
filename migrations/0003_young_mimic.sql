CREATE TYPE "public"."action_type" AS ENUM('Waiting For', 'Now', 'Nothing');--> statement-breakpoint
CREATE TABLE "action_tags" (
	"actionId" uuid,
	"tagId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ins" DROP CONSTRAINT "ins_moved_actions_id_fk";
--> statement-breakpoint
ALTER TABLE "actions" ADD COLUMN "archived" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "actions" ADD COLUMN "type" "action_type" DEFAULT 'Nothing' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "archived" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "action_tags" ADD CONSTRAINT "action_tags_actionId_actions_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_tags" ADD CONSTRAINT "action_tags_tagId_tags_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;