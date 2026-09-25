import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  buildRefinePrompt,
  buildSystemPrompt,
  buildUserPrompt,
  extractJsonText,
} from "./generate";

const PORT = Number(process.env.PORT || 8787);
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 45_000);
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

import path from "node:path";
import fs from "node:fs";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const distPath = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.GROQ_API_KEY) });
});

app.post("/api/generate", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your_key_here")) {
    res.status(500).json({
      kind: "failed",
      message:
        "Missing GROQ_API_KEY. Copy .env.example to .env and add a free key from console.groq.com/keys.",
    });
    return;
  }

  const input = typeof req.body?.input === "string" ? req.body.input.trim() : "";
  const refineInstruction =
    typeof req.body?.refineInstruction === "string"
      ? req.body.refineInstruction.trim()
      : "";
  const previousPack = req.body?.previousPack;

  if (!input && !refineInstruction) {
    res.status(400).json({
      kind: "failed",
      message: "Paste some notes, a topic, or a refinement instruction.",
    });
    return;
  }

  const userContent =
    refineInstruction && previousPack
      ? buildRefinePrompt(refineInstruction, JSON.stringify(previousPack))
      : buildUserPrompt(input);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);

  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userContent },
        ],
      }),
      signal: controller.signal,
    });

    const groqJson = (await groqResponse.json()) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };

    if (!groqResponse.ok) {
      const message = groqJson.error?.message || `Groq returned HTTP ${groqResponse.status}`;
      res.status(502).json({ kind: "failed", message });
      return;
    }

    const content = groqJson.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) {
      res.status(502).json({
        kind: "empty",
        message: "The model returned an empty response.",
      });
      return;
    }

    const jsonText = extractJsonText(content);
    if (!jsonText) {
      res.status(502).json({
        kind: "malformed",
        message: "The model did not return a JSON object.",
        raw: content,
      });
      return;
    }

    try {
      JSON.parse(jsonText);
    } catch {
      res.status(502).json({
        kind: "malformed",
        message: "The model output was not valid JSON.",
        raw: content,
      });
      return;
    }

    res.json({ raw: jsonText });
  } catch (error) {
    const aborted =
      controller.signal.aborted ||
      (error instanceof Error && error.name === "AbortError");

    if (aborted) {
      res.status(504).json({
        kind: "timeout",
        message: "The model took too long to respond.",
      });
      return;
    }

    res.status(502).json({
      kind: "failed",
      message: "Could not reach the language model.",
    });
  } finally {
    clearTimeout(timeout);
  }
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const indexHtml = path.resolve(distPath, "index.html");
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Study desk API on http://127.0.0.1:${PORT}`);
});
