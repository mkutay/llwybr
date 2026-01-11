import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";

config({ path: ".env" });

// biome-ignore lint/style/noNonNullAssertion: we know it's defined
export const db = drizzle(process.env.DATABASE_URL!);
