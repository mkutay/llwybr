ALTER TABLE "action_tags" DROP CONSTRAINT "action_tags_actionId_actions_id_fk";
--> statement-breakpoint
ALTER TABLE "action_tags" ADD CONSTRAINT "action_tags_actionId_actions_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE no action;
