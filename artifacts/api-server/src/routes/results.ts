import { Router } from "express";
import { db, resultsTable, usersTable, eq } from "@workspace/db";
import { SaveResultBody } from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router = Router();

function formatResult(r: typeof resultsTable.$inferSelect) {
  return {
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
  };
}

// POST /results
router.post("/results", async (req, res) => {
  const parsed = SaveResultBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { profile, cogPct, enPct, adPct, tagline, answers } = parsed.data;

  let userId: number | null = null;
  let userName: string | null = null;

  const sessionUserId = req.session?.userId;
  if (sessionUserId) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId)).limit(1);
    if (user) {
      userId = user.id;
      userName = user.name;
    }
  }

  const [result] = await db.insert(resultsTable).values({
    userId,
    userName,
    profile,
    cogPct,
    enPct,
    adPct,
    tagline,
    answers: answers as Record<string, unknown>,
  }).returning();

  return res.status(201).json(formatResult(result));
});

// GET /results/my
router.get("/results/my", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(200).json([]);
  }

  const results = await db.select().from(resultsTable)
    .where(eq(resultsTable.userId, userId))
    .orderBy(desc(resultsTable.createdAt));

  return res.status(200).json(results.map(formatResult));
});

// GET /results/:id
router.get("/results/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const [result] = await db.select().from(resultsTable).where(eq(resultsTable.id, id)).limit(1);
  if (!result) {
    return res.status(404).json({ error: "Result not found" });
  }

  return res.status(200).json(formatResult(result));
});

export default router;
