# LibSQL DB module
Instructions on how to setup a libSQL DB on the app.

## 1. Install libSQL and Drizzle
Install the libsql, drizzle-orm, drizzle-kit and better-sqlite3 packages:

```bash
pnpm add libsql drizzle-orm
pnpm add drizzle-kit@0.22.8 better-sqlite3 -D
```

## 2. Create the schema
Go to `db/schema.ts` and create the schema for your database. Export a variable for every table you want to create:

```ts
import {int, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: int("id", {mode: "number"}).primaryKey(),
  text: text("text"),
  done: int("done", {mode: "boolean"}),
});
```
> This will create a "todos" table with an id, text and done column.

## 3. Create the database
Run the push command to let Drizzle create the tables:

```bash
pnpm drizzle-kit push
```
> Run this command anytime your schema changes.

## 4. Run Drizzle studio
Let's add some data using Drizzle Studio:

```bash
pnpm drizzle-kit studio
```
> Add some data to the "todos" table.

## 5. Use the database
Run queries in your server components to fetch data:

```tsx
import db from "@/db";
import {todos} from "@/db/schema";

export default async function HomePage() {
  const data = db.select().from(todos).all();

  return (
    <ul>
      {data.map((todo) => (
        <li key={String(todo.id)} style={{textDecoration: todo.done ? "line-through" : "none"}}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```
