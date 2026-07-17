import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  numeric,
  boolean,
  date,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transactionType = pgEnum("transaction_type", ["income", "expense"]);
export const listStatus = pgEnum("list_status", ["open", "done"]);

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: varchar("phone", { length: 40 }),
  avatarUrl: text("avatar_url"),
  accentColor: varchar("accent_color", { length: 20 }),
  theme: varchar("theme", { length: 10 }),
  /**
   * Itens escolhidos para a dock, separados por vírgula (ex.: "mes,compras").
   * "inicio" é fixo e não entra aqui — a gaveta de funcionalidades vive nele,
   * então perder o Início na dock trancaria o acesso ao resto.
   * Nulo = padrão (ver lib/dock.ts).
   */
  dockItems: varchar("dock_items", { length: 120 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    householdId: integer("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    type: transactionType("type").notNull(),
    color: varchar("color", { length: 20 }).notNull().default("#8b5cf6"),
    icon: varchar("icon", { length: 40 }).notNull().default("tag"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("categories_household_idx").on(t.householdId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    householdId: integer("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    type: transactionType("type").notNull(),
    description: varchar("description", { length: 200 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: date("date").notNull(),
    // Para saídas = paga; para entradas = recebida.
    paid: boolean("paid").notNull().default(false),
    createdBy: integer("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("transactions_household_date_idx").on(t.householdId, t.date)],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: serial("id").primaryKey(),
    householdId: integer("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("suppliers_household_idx").on(t.householdId)],
);

export const shoppingLists = pgTable(
  "shopping_lists",
  {
    id: serial("id").primaryKey(),
    householdId: integer("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    supplierId: integer("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 160 }).notNull(),
    status: listStatus("status").notNull().default("open"),
    createdBy: integer("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("shopping_lists_household_idx").on(t.householdId)],
);

export const shoppingListItems = pgTable(
  "shopping_list_items",
  {
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => shoppingLists.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 })
      .notNull()
      .default("1"),
    price: numeric("price", { precision: 12, scale: 2 }),
    checked: boolean("checked").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("shopping_list_items_list_idx").on(t.listId)],
);

// ----- Manutenção veicular -----

export const vehicles = pgTable(
  "vehicles",
  {
    id: serial("id").primaryKey(),
    householdId: integer("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    plate: varchar("plate", { length: 10 }),
    year: integer("year"),
    /** Texto livre: "Flex", "Diesel"... */
    fuel: varchar("fuel", { length: 20 }),
    /** Motor, ex.: "1.0" */
    engine: varchar("engine", { length: 10 }),
    color: varchar("color", { length: 20 }).notNull().default("#6d4bd8"),
    icon: varchar("icon", { length: 40 }).notNull().default("car"),
    /** De quantos em quantos dias pedir a quilometragem (0 = não pedir). */
    reminderDays: integer("reminder_days").notNull().default(30),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("vehicles_household_idx").on(t.householdId)],
);

/**
 * Histórico do odômetro. Guardamos as leituras (e não só o km atual) porque a
 * média de km/mês e a data prevista de cada item saem da variação entre elas.
 */
export const odometerReadings = pgTable(
  "odometer_readings",
  {
    id: serial("id").primaryKey(),
    vehicleId: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    km: integer("km").notNull(),
    date: date("date").notNull(),
    createdBy: integer("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("odometer_readings_vehicle_date_idx").on(t.vehicleId, t.date)],
);

/**
 * Item controlado (troca de óleo, alinhamento...).
 *
 * O intervalo pode ser por km, por tempo, ou os dois — quando há os dois,
 * vence o que vier primeiro. `lastDoneKm`/`lastDoneDate` são a base a partir
 * da qual o próximo vencimento é contado.
 */
export const maintenanceItems = pgTable(
  "maintenance_items",
  {
    id: serial("id").primaryKey(),
    vehicleId: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    intervalKm: integer("interval_km"),
    intervalMonths: integer("interval_months"),
    lastDoneKm: integer("last_done_km"),
    lastDoneDate: date("last_done_date"),
    icon: varchar("icon", { length: 40 }).notNull().default("wrench"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("maintenance_items_vehicle_idx").on(t.vehicleId)],
);

// ----- Relations -----
export const householdsRelations = relations(households, ({ many }) => ({
  users: many(users),
  categories: many(categories),
  transactions: many(transactions),
  suppliers: many(suppliers),
  shoppingLists: many(shoppingLists),
  vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  household: one(households, {
    fields: [vehicles.householdId],
    references: [households.id],
  }),
  readings: many(odometerReadings),
  items: many(maintenanceItems),
}));

export const odometerReadingsRelations = relations(
  odometerReadings,
  ({ one }) => ({
    vehicle: one(vehicles, {
      fields: [odometerReadings.vehicleId],
      references: [vehicles.id],
    }),
  }),
);

export const maintenanceItemsRelations = relations(
  maintenanceItems,
  ({ one }) => ({
    vehicle: one(vehicles, {
      fields: [maintenanceItems.vehicleId],
      references: [vehicles.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  household: one(households, {
    fields: [categories.householdId],
    references: [households.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  household: one(households, {
    fields: [transactions.householdId],
    references: [households.id],
  }),
}));

export const shoppingListsRelations = relations(
  shoppingLists,
  ({ one, many }) => ({
    supplier: one(suppliers, {
      fields: [shoppingLists.supplierId],
      references: [suppliers.id],
    }),
    items: many(shoppingListItems),
  }),
);

export const shoppingListItemsRelations = relations(
  shoppingListItems,
  ({ one }) => ({
    list: one(shoppingLists, {
      fields: [shoppingListItems.listId],
      references: [shoppingLists.id],
    }),
  }),
);

export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type OdometerReading = typeof odometerReadings.$inferSelect;
export type MaintenanceItem = typeof maintenanceItems.$inferSelect;
