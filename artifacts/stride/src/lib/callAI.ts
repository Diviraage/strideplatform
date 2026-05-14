export async function callAI(prompt: string): Promise<string> {
  try {
    const base = import.meta.env.BASE_URL ?? '/';
    const apiBase = base.replace(/\/$/, '');
    const res = await fetch(`${apiBase}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { text?: string; error?: string };
    return data.text ?? 'Помилка отримання відповіді.';
  } catch (e: any) {
    return `Помилка зʼєднання: ${e.message ?? 'невідома'}`;
  }
}
