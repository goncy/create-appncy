import Database from "libsql";
import {drizzle} from "drizzle-orm/better-sqlite3";

const raw = new Database("data.db");
const db = drizzle(raw);

export default db;
