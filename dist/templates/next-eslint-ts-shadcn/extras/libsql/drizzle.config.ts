import {defineConfig} from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: "data.db",
  },
  verbose: true,
  strict: true,
});
