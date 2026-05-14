import { Router } from "express";
import { createHash } from "crypto";
import { db, usersTable, eq } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "stride_salt_2024").digest("hex");
}

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { email, password, name, age } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const allUsers = await db.select().from(usersTable).limit(1);
  const isFirstUser = allUsers.length === 0;

  const [user] = await db.insert(usersTable).values({
    email,
    name,
    passwordHash: hashPassword(password),
    age: age ?? null,
    isAdmin: isFirstUser,
  }).returning();

  req.session!.userId = user.id;

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      isAdmin: user.isAdmin,
    },
  });
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session!.userId = user.id;

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      isAdmin: user.isAdmin,
    },
  });
});

// GET /auth/me
router.get("/auth/me", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
    isAdmin: user.isAdmin,
  });
});

// POST /auth/logout
router.post("/auth/logout", (req, res) => {
  req.session?.destroy(() => {});
  res.status(200).json({ ok: true });
});

export default router;
