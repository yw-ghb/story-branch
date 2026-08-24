import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";
import { demoGenerate } from "@/lib/demo";
import type { GenerateRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_URL = process.env.AI_BASE_URL || "https://api.deepseek.com";
const API_KEY = process.env.AI_API_KEY || "";
const MODEL = process.env.AI_MODEL || "deepseek-chat";

function sanitize(data: { scene?: unknown; choices?: unknown }): {
  scene: string;
  choices: string[];
} | null {
  const scene = typeof data.scene === "string" ? data.scene.trim() : "";
  const choices = Array.isArray(data.choices)
    ? data.choices.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    : [];
  if (!scene || choices.length < 2) return null;
  return { scene, choices: choices.slice(0, 3) };
}

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  if (!body?.genre || !body?.character?.name) {
    return NextResponse.json({ error: "缺少必要的故事设定" }, { status: 400 });
  }

  // 未配置 Key 时进入演示模式（界面会标注）
  if (!API_KEY) {
    return NextResponse.json(demoGenerate(body));
  }

  const { system, user } = buildPrompt(body);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.9,
        max_tokens: 700,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("LLM API error:", res.status, detail.slice(0, 300));
      return NextResponse.json(
        { error: "AI 服务暂时不可用，请稍后重试" },
        { status: 502 }
      );
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // 模型偶尔会在 JSON 外包裹 markdown 代码块，做一次剥离重试
      const stripped = content.replace(/```(?:json)?/g, "").trim();
      try {
        parsed = JSON.parse(stripped);
      } catch {
        console.error("Failed to parse LLM output:", content.slice(0, 300));
        return NextResponse.json(
          { error: "AI 返回格式异常，请重试一次" },
          { status: 502 }
        );
      }
    }

    const clean = sanitize(parsed as Record<string, unknown>);
    if (!clean) {
      return NextResponse.json(
        { error: "AI 返回内容不完整，请重试一次" },
        { status: 502 }
      );
    }

    return NextResponse.json(clean);
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "AI 响应超时，请重试" : "网络异常，请重试" },
      { status: 502 }
    );
  }
}
