import "server-only";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { z } from "zod";

export type Provider = "gemini" | "groq";

export type JsonResult<T> = { data: T; provider: Provider };

type JsonRequest<S extends z.ZodType> = {
  system: string;
  prompt: string;
  schema: S;
  /** Higher = more varied. Editorial work wants low. */
  temperature?: number;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const TIMEOUT_MS = 45_000;

function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms)),
  ]);
}

/** Retry overloaded/rate-limited calls briefly before falling back to the other provider. */
async function retryTransient<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const msg = (e as Error).message;
      const transient = /(429|500|503)|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/i.test(msg);
      if (!transient || i >= tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** i));
    }
  }
}

function parseJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed);
}

async function callGemini<S extends z.ZodType>(req: JsonRequest<S>): Promise<z.infer<S>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  const ai = new GoogleGenAI({ apiKey: key });
  const res = await retryTransient(() => withTimeout(
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: req.prompt,
      config: {
        systemInstruction: req.system,
        temperature: req.temperature ?? 0.3,
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(req.schema, { target: "draft-7" }),
        // Flash models think by default; editing and briefing don't need it and it costs latency.
        ...(GEMINI_MODEL.includes("flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    }),
  ));
  return req.schema.parse(parseJson(res.text ?? ""));
}

async function callGroq<S extends z.ZodType>(req: JsonRequest<S>): Promise<z.infer<S>> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");
  const groq = new Groq({ apiKey: key });
  const schema = JSON.stringify(z.toJSONSchema(req.schema, { target: "draft-7" }));
  const res = await withTimeout(
    groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: req.temperature ?? 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${req.system}\n\nRespond with a single JSON object that matches this JSON Schema exactly:\n${schema}`,
        },
        { role: "user", content: req.prompt },
      ],
    }),
  );
  return req.schema.parse(parseJson(res.choices[0]?.message?.content ?? ""));
}

/**
 * One interface for structured AI output: Gemini first, Groq on any failure
 * (quota, timeout, invalid JSON). Throws only if both fail.
 */
export async function generateJson<S extends z.ZodType>(req: JsonRequest<S>): Promise<JsonResult<z.infer<S>>> {
  const errors: string[] = [];
  try {
    return { data: await callGemini(req), provider: "gemini" };
  } catch (e) {
    errors.push(`gemini: ${(e as Error).message}`);
  }
  try {
    return { data: await callGroq(req), provider: "groq" };
  } catch (e) {
    errors.push(`groq: ${(e as Error).message}`);
  }
  throw new Error(errors.join(" | "));
}
