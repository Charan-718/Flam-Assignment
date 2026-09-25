import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { LoadingState } from "./components/LoadingState";
import { PromptInput } from "./components/PromptInput";
import { ResultView } from "./components/ResultView";
import { generateStudyPack } from "./lib/api";
import type { AppError, AppStatus, StudyPack } from "./types/result";
import "./index.css";

const SESSION_KEY = "flam-study-desk:last-pack";

function readSavedPack(): StudyPack | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudyPack;
    if (!parsed?.cards?.length || !parsed?.quiz?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

type Job = {
  mode: "create" | "retry" | "refine";
  refineInstruction?: string;
};

export default function App() {
  const [notes, setNotes] = useState("");
  const [pack, setPack] = useState<StudyPack | null>(() => readSavedPack());
  const [status, setStatus] = useState<AppStatus>(() => (readSavedPack() ? "ready" : "idle"));
  const [error, setError] = useState<AppError | null>(null);
  const [loadingLabel, setLoadingLabel] = useState("Turning notes into a pack");
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const lastJob = useRef<Job>({ mode: "create" });

  useEffect(() => {
    if (pack) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(pack));
    }
  }, [pack]);

  const runGenerate = useCallback(
    async (job: Job) => {
      const input = notes.trim();
      if (job.mode !== "refine" && !input) return;
      if (job.mode === "refine" && (!job.refineInstruction || !pack)) return;

      lastJob.current = job;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const id = ++requestId.current;

      setStatus("loading");
      setError(null);
      setLoadingLabel(
        job.mode === "refine" ? "Editing the current pack" : "Turning notes into a pack"
      );

      try {
        const result = await generateStudyPack(
          {
            input,
            refineInstruction: job.refineInstruction,
            previousPack: job.mode === "refine" ? pack ?? undefined : undefined,
          },
          controller.signal
        );
        if (id !== requestId.current) return;
        setPack(result.pack);
        setStatus("ready");
      } catch (caught) {
        if (id !== requestId.current) return;
        const next = caught as AppError;
        setError({
          kind: next.kind ?? "failed",
          message: next.message ?? "Something went wrong.",
          detail: next.detail,
        });
        setStatus("error");
      }
    },
    [notes, pack]
  );

  const reset = () => {
    abortRef.current?.abort();
    requestId.current += 1;
    setStatus("idle");
    setError(null);
    setPack(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Flam frontend assignment</p>
        <h1>Study desk</h1>
        <p className="lede">
          Paste notes. Get a flip deck and a quiz you can actually use — including a retest of
          whatever you missed.
        </p>
      </header>

      <main className="layout">
        <section className="column">
          <PromptInput
            value={notes}
            onChange={setNotes}
            onSubmit={() => void runGenerate({ mode: "create" })}
            disabled={status === "loading"}
          />
        </section>

        <section className="column">
          {status === "idle" && !pack ? <EmptyState /> : null}
          {status === "loading" ? <LoadingState label={loadingLabel} /> : null}
          {status === "error" && error ? (
            <ErrorState
              error={error}
              onRetry={() => void runGenerate(lastJob.current)}
              onReset={reset}
            />
          ) : null}
          {pack && (status === "ready" || status === "error" || status === "loading") ? (
            <div className={status === "loading" ? "result-wrap result-wrap--dim" : "result-wrap"}>
              <ResultView
                pack={pack}
                refining={status === "loading"}
                onRefine={(instruction) =>
                  void runGenerate({ mode: "refine", refineInstruction: instruction })
                }
              />
            </div>
          ) : null}
        </section>
      </main>

      <footer className="foot">
        <span>API key stays on the server. Structured JSON only.</span>
        {pack ? (
          <button className="btn btn--ghost" type="button" onClick={reset}>
            Clear saved pack
          </button>
        ) : null}
      </footer>
    </div>
  );
}
