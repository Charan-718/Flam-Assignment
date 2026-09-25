import type { AppError } from "../types/result";
import { validateResult } from "./validateResult";
import type { StudyPack } from "../types/result";

const REQUEST_TIMEOUT_MS = 50_000;

export type GenerateRequest = {
  input: string;
  refineInstruction?: string;
  previousPack?: StudyPack;
};

export type GenerateSuccess = {
  pack: StudyPack;
};

function errorFromStatus(status: number, bodyMessage?: string): AppError {
  if (status === 408 || status === 504) {
    return {
      kind: "timeout",
      message: "The model took too long. Try a shorter prompt, or retry.",
      detail: bodyMessage,
    };
  }
  return {
    kind: "failed",
    message: bodyMessage || "The request failed before we got a usable result.",
    detail: `HTTP ${status}`,
  };
}

export async function generateStudyPack(
  payload: GenerateRequest,
  signal: AbortSignal
): Promise<GenerateSuccess> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);

  const onAbort = () => controller.abort(signal.reason);
  if (signal.aborted) {
    controller.abort(signal.reason);
  } else {
    signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      if (!response.ok) {
        throw errorFromStatus(response.status);
      }
      const err: AppError = {
        kind: "malformed",
        message: "The server returned a non-JSON body.",
      };
      throw err;
    }

    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    if (!response.ok) {
      const kind = typeof record.kind === "string" ? record.kind : undefined;
      const message =
        typeof record.message === "string" ? record.message : undefined;
      if (kind === "malformed" || kind === "empty" || kind === "wrong_shape" || kind === "timeout") {
        const err: AppError = {
          kind,
          message: message || "The model response could not be used.",
        };
        throw err;
      }
      throw errorFromStatus(response.status, message);
    }

    const raw = record.raw ?? record.data;
    const validated = validateResult(raw);
    if (!validated.ok) {
      const err: AppError = {
        kind: validated.reason,
        message: validated.message,
      };
      throw err;
    }

    return { pack: validated.data };
  } catch (caught) {
    if (caught && typeof caught === "object" && "kind" in caught) {
      throw caught;
    }
    if (controller.signal.aborted || signal.aborted) {
      const reason = controller.signal.reason ?? signal.reason;
      const timedOut = reason === "timeout" || String(reason) === "timeout";
      const err: AppError = timedOut
        ? {
            kind: "timeout",
            message: "The request timed out. Nothing was applied.",
          }
        : {
            kind: "failed",
            message: "The request was cancelled.",
          };
      throw err;
    }
    const err: AppError = {
      kind: "failed",
      message: "Could not reach the study desk server. Is it running?",
    };
    throw err;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", onAbort);
  }
}
