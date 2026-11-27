
export const AI_NOT_CONFIGURED = "AI is not configured yet. Add ANTHROPIC_API_KEY to your environment variables.";

export async function generateText(opts: { system: string; prompt: string; maxTokens?: number }): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error(AI_NOT_CONFIGURED);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
      max_tokens: opts.maxTokens ?? 2000,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    }),
  });
  if (!res.ok) throw new Error(`The AI request failed (status ${res.status}). Please try again.`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (json.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("").trim();
  if (!text) throw new Error("The AI returned an empty response. Please try again.");
  return text;
}
