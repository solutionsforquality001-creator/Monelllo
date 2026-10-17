import { pgTable, serial, varchar, text, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("0.00"),
  referralCode: varchar("referral_code", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  roiPercent: integer("roi_percent").notNull(),
  durationDays: integer("duration_days").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  expectedReturn: numeric("expected_return", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
