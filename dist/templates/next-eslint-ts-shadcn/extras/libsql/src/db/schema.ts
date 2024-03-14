import {int, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: int("id", {mode: "number"}).primaryKey(),
  text: text("text"),
  done: int("done", {mode: "boolean"}),
});
