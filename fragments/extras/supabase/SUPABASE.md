# Supabase DB module
Instructions on how to setup db on the app.

## 1. Create the Supabase project
[Create a new Supabase project](https://database.new/) and add the following variables to the `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=
SUPABASE_ACCESS_TOKEN=
```
> Also create the schema and tables you need for the app now, we will generate types later and this is needed.

## 2. Install the Supabase client
Install the Supabase client in your project:

```bash
pnpm add @supabase/supabase-js
```

## 3. Generate the types
Run the `gen types` command in your terminal specifying the project id:

```bash
pnpx supabase login
pnpx supabase gen types typescript --project-id yourprojectid > ./src/db/types.ts
```
> Run this command anytime your schema changes.

## 4. Use the client in your app
import the respective clients (server and client) from the `db` folder and use them in your app:

```ts
import db from "@/db/api/server";

async function getMatches() {
  const {data: matches, error} = await supabase
    .from("matches")
    .select()
    .order("date", {ascending: false});

  return matches ?? [];
}
```
