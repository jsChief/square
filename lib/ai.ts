import { categoryLabels, conditionLabels } from "@/lib/utils";
import type { Category, Condition } from "@/types";

export type DraftSource = "openai" | "anthropic" | "google" | "template";

interface DraftInput {
  title: string;
  category: Category;
  condition: Condition;
}

const SYSTEM_PROMPT = [
  "You write listing descriptions for square, a local secondhand marketplace.",
  "Be warm, plain-spoken, and concise. Help a nearby buyer picture the item.",
  "Never invent specifications, flaws, brands, dimensions, or pickup details that were not provided.",
  "Do not use markdown, headings, emoji, hashtags, or contact information.",
].join(" ");

function userPrompt({ title, category, condition }: DraftInput) {
  return [
    "Write a marketplace description for this item.",
    `Title: ${title}`,
    `Category: ${categoryLabels[category]}`,
    `Condition supplied by the seller: ${conditionLabels[condition]}`,
    "",
    "Use two short paragraphs. In the first, describe the item and the supplied condition without adding facts.",
    "In the second, explain in a friendly way that local pickup makes it easy to see the item before buying.",
    "Keep the whole description under 90 words.",
  ].join("\n");
}

function templateDescription({ title, category, condition }: DraftInput) {
  return [
    `${title} is a ${conditionLabels[condition].toLowerCase()} ${categoryLabels[category].toLowerCase()} item looking for a new home nearby.`,
    "Local pickup makes it easy to see it before you buy. Ask the seller for more details if you'd like.",
  ].join("\n\n");
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 1200);
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!response.ok) {
    console.error("AI provider error", response.status, text.slice(0, 500));
    throw new Error("AI provider request failed");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("AI provider returned invalid JSON");
  }
}

function extractText(data: unknown, provider: Exclude<DraftSource, "template">) {
  if (provider === "openai") {
    const result = data as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = result.choices?.[0]?.message?.content;
    return typeof text === "string" ? text : null;
  }

  if (provider === "anthropic") {
    const result = data as { content?: Array<{ text?: string }> };
    const text = result.content?.find((block) => typeof block.text === "string")
      ?.text;
    return typeof text === "string" ? text : null;
  }

  const result = data as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = result.candidates?.[0]?.content?.parts?.find(
    (part) => typeof part.text === "string",
  )?.text;
  return typeof text === "string" ? text : null;
}

async function requestDraft(
  provider: Exclude<DraftSource, "template">,
  apiKey: string,
  input: DraftInput,
) {
  const prompt = userPrompt(input);
  const signal = AbortSignal.timeout(15_000);
  let url: string;
  let init: RequestInit;

  if (provider === "openai") {
    url = "https://api.openai.com/v1/chat/completions";
    init = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
      signal,
    };
  } else if (provider === "anthropic") {
    url = "https://api.anthropic.com/v1/messages";
    init = {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
        max_tokens: 300,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    };
  } else {
    const model = process.env.GOOGLE_MODEL ?? "gemini-2.0-flash";
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      }),
      signal,
    };
  }

  const data = await readJson(await fetch(url, init));
  const text = extractText(data, provider);
  if (!text?.trim()) throw new Error("AI provider returned an empty draft");
  return normalizeText(text);
}

interface ProviderConfig {
  name: Exclude<DraftSource, "template">;
  key?: string;
}

function configuredProviders(): ProviderConfig[] {
  return [
    { name: "openai", key: process.env.OPENAI_API_KEY },
    { name: "anthropic", key: process.env.ANTHROPIC_API_KEY },
    {
      name: "google",
      key: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
  ];
}

/** Drafts a listing description from a configured model, or a labelled sample when none is configured. */
export async function generateDescription(
  input: DraftInput,
): Promise<{ description: string; source: DraftSource }> {
  const preferred = process.env.AI_PROVIDER?.trim().toLowerCase();
  const providers = configuredProviders();

  let selected: ProviderConfig | undefined;
  if (preferred && preferred !== "auto") {
    selected = providers.find((provider) => provider.name === preferred);
    if (!selected?.key) {
      throw new Error(`AI_PROVIDER is set to ${preferred} but no API key is configured`);
    }
  } else {
    selected = providers.find((provider) => Boolean(provider.key));
  }

  if (!selected?.key) {
    return { description: templateDescription(input), source: "template" };
  }

  try {
    return {
      description: await requestDraft(selected.name, selected.key, input),
      source: selected.name,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "AI provider request failed") {
      throw error;
    }
    console.error("AI draft failed", error);
    throw new Error("Could not draft a description right now");
  }
}
