CREATE TABLE "maintenance_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"interval_km" integer,
	"interval_months" integer,
	"last_done_km" integer,
	"last_done_date" date,
	"icon" varchar(40) DEFAULT 'wrench' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odometer_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"km" integer NOT NULL,
	"date" date NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"household_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"plate" varchar(10),
	"year" integer,
	"fuel" varchar(20),
	"engine" varchar(10),
	"color" varchar(20) DEFAULT '#6d4bd8' NOT NULL,
	"icon" varchar(40) DEFAULT 'car' NOT NULL,
	"reminder_days" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dock_items" varchar(120);--> statement-breakpoint
ALTER TABLE "maintenance_items" ADD CONSTRAINT "maintenance_items_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odometer_readings" ADD CONSTRAINT "odometer_readings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odometer_readings" ADD CONSTRAINT "odometer_readings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "maintenance_items_vehicle_idx" ON "maintenance_items" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "odometer_readings_vehicle_date_idx" ON "odometer_readings" USING btree ("vehicle_id","date");--> statement-breakpoint
CREATE INDEX "vehicles_household_idx" ON "vehicles" USING btree ("household_id");