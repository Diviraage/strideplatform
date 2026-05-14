import * as schema from "./schema";
export declare const pool: import("pg").Pool;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("pg").Pool;
};
export * from "./schema";
export { eq, and, or, desc, asc, sql, count, ilike, inArray, isNull, isNotNull, gt, lt, gte, lte, ne } from "drizzle-orm";
//# sourceMappingURL=index.d.ts.map