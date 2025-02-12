import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  name: text("name").notNull(),
  //   TODO: add bannar field
  imageUrl:text("image_url").notNull(),
  createAt:timestamp("create_at").defaultNow().notNull(),
  updateAt:timestamp("update_at").defaultNow().notNull(),
},(t)=>[uniqueIndex("clerk_id_idx").on(t.clerkId)]);


