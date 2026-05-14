import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.post("/ai/generate", async (req, res) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.choices[0]?.message?.content ?? "Помилка отримання відповіді.";
    return res.json({ text });
  } catch (e: any) {
    req.log.error({ err: e }, "AI generate error");
    return res.status(500).json({ error: "AI error: " + (e.message ?? "unknown") });
  }
});

export default router;
