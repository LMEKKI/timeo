CREATE TYPE "public"."user_role" AS ENUM('GLOBAL_ADMIN', 'BRANCH_MANAGER', 'FIELD_TECHNICIAN');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branch" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_config" (
	"company_id" text PRIMARY KEY NOT NULL,
	"settings" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consumed_material" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"internal_reference" text
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"name" text NOT NULL,
	"billing_address" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_template" (
	"id" text PRIMARY KEY NOT NULL,
	"job_type_id" text NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"question_schema" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"job_type_id" text NOT NULL,
	"form_template_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"status" text NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"scheduled_start_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_assignment" (
	"job_id" text NOT NULL,
	"user_profile_id" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"user_profile_id" text NOT NULL,
	"previous_status" text NOT NULL,
	"new_status" text NOT NULL,
	"comment_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_billing_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"historical_customer_name" text NOT NULL,
	"historical_address_raw" text NOT NULL,
	"historical_form_responses" jsonb NOT NULL,
	"customer_signature_hash" text NOT NULL,
	"sealed_at" timestamp NOT NULL,
	CONSTRAINT "job_billing_snapshot_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "job_type" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"estimated_duration_minutes" integer
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" text PRIMARY KEY NOT NULL,
	"user_profile_id" text NOT NULL,
	"role" "user_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "system_config" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"min_required_app_version" text NOT NULL,
	"is_maintenance_active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"auth_provider_id" text NOT NULL,
	"branch_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_profile_auth_provider_id_unique" UNIQUE("auth_provider_id"),
	CONSTRAINT "user_profile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_setting" (
	"user_profile_id" text PRIMARY KEY NOT NULL,
	"push_notification_token" text,
	"last_login_at" timestamp,
	"settings" jsonb
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_config" (
	"id" text PRIMARY KEY NOT NULL,
	"job_type_id" text NOT NULL,
	"engine_type" text NOT NULL,
	"approval_required" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch" ADD CONSTRAINT "branch_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumed_material" ADD CONSTRAINT "consumed_material_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_job_type_id_job_type_id_fk" FOREIGN KEY ("job_type_id") REFERENCES "public"."job_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_assignment" ADD CONSTRAINT "job_assignment_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_assignment" ADD CONSTRAINT "job_assignment_user_profile_id_user_profile_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_audit_log" ADD CONSTRAINT "job_audit_log_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_audit_log" ADD CONSTRAINT "job_audit_log_user_profile_id_user_profile_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_billing_snapshot" ADD CONSTRAINT "job_billing_snapshot_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_user_profile_id_user_profile_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_profile_id_user_profile_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_config" ADD CONSTRAINT "workflow_config_job_type_id_job_type_id_fk" FOREIGN KEY ("job_type_id") REFERENCES "public"."job_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_job_status" ON "job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_branch_id" ON "job" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_job_scheduled_at" ON "job" USING btree ("scheduled_start_at");--> statement-breakpoint
CREATE INDEX "idx_job_customer_id" ON "job" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");