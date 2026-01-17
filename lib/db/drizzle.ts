import { drizzle } from "drizzle-orm/node-postgres";

// biome-ignore lint/style/noNonNullAssertion: we know it's defined
export const db = drizzle(process.env.DATABASE_URL!);
