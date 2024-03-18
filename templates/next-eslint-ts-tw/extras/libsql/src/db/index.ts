import Database from "libsql";
import {drizzle} from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

const raw = new Database("data.db");
const db = drizzle(raw, {schema});

export default db;
