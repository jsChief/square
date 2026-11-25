import { NextResponse } from "next/server";
import { generateDescription, type DraftSource } from "@/lib/ai";
import { categoryLabels } from "@/lib/utils";
import type { Category, Condition } from "@/types";

interface GenerateRequest {
  title?: unknown;
  category?: unknown;
  condition?: unknown;
}

const sellableConditions: Condition[] = ["new", "like-new", "good", "fair"];

export async function POST(request: Request) {
  let body: GenerateRequest;

  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const categoryValue = typeof body.category === "string" ? body.category : "";
  const conditionValue = typeof body.condition === "string" ? body.condition : "";

  if (!title) {
    return NextResponse.json({ error: "A title is required" }, { status: 400 });
  }
  if (title.length > 120) {
    return NextResponse.json(
      { error: "Keep the title under 120 characters" },
      { status: 400 },
    );
  }
  if (!Object.prototype.hasOwnProperty.call(categoryLabels, categoryValue)) {
    return NextResponse.json({ error: "Choose a valid category" }, { status: 400 });
  }
  if (!sellableConditions.includes(conditionValue as Condition)) {
    return NextResponse.json({ error: "Choose a valid condition" }, { status: 400 });
  }

  try {
    const result = await generateDescription({
      title,
      category: categoryValue as Category,
      condition: conditionValue as Condition,
    });

    return NextResponse.json({
      description: result.description,
      source: result.source satisfies DraftSource,
    });
  } catch (error) {
    console.error("POST /api/ai failed", error);
    return NextResponse.json(
      { error: "Couldn't draft a description. Try again in a moment." },
      { status: 502 },
    );
  }
}
