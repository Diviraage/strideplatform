import { Router } from "express";
import { db, resultsTable, usersTable, eq } from "@workspace/db";
import { desc, sql, count } from "drizzle-orm";

const router = Router();

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || !user.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

// GET /admin/stats
router.get("/admin/stats", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [resultCount] = await db.select({ count: count() }).from(resultsTable);

  const results = await db.select({
    profile: resultsTable.profile,
    cogPct: resultsTable.cogPct,
    enPct: resultsTable.enPct,
    adPct: resultsTable.adPct,
  }).from(resultsTable);

  const total = results.length;
  const avgCogPct = total > 0 ? Math.round(results.reduce((s, r) => s + r.cogPct, 0) / total) : 0;
  const avgEnPct = total > 0 ? Math.round(results.reduce((s, r) => s + r.enPct, 0) / total) : 0;
  const avgAdPct = total > 0 ? Math.round(results.reduce((s, r) => s + r.adPct, 0) / total) : 0;

  const profileCounts: Record<string, number> = {};
  for (const r of results) {
    profileCounts[r.profile] = (profileCounts[r.profile] || 0) + 1;
  }

  return res.status(200).json({
    totalUsers: userCount.count,
    totalResults: resultCount.count,
    avgCogPct,
    avgEnPct,
    avgAdPct,
    profileCounts,
  });
});

// GET /admin/users
router.get("/admin/users", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const results = await db.select().from(resultsTable).orderBy(desc(resultsTable.createdAt));

  const adminUsers = users.map((u) => {
    const userResults = results.filter((r) => r.userId === u.id);
    const last = userResults[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      age: u.age,
      isAdmin: u.isAdmin,
      resultCount: userResults.length,
      lastProfile: last?.profile ?? null,
      lastResultAt: last?.createdAt.toISOString() ?? null,
    };
  });

  return res.status(200).json(adminUsers);
});

// GET /admin/results
router.get("/admin/results", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const results = await db.select().from(resultsTable).orderBy(desc(resultsTable.createdAt)).limit(200);

  return res.status(200).json(results.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    profile: r.profile,
    cogPct: r.cogPct,
    enPct: r.enPct,
    adPct: r.adPct,
    tagline: r.tagline,
    answers: r.answers,
    createdAt: r.createdAt.toISOString(),
  })));
});

export default router;
