# Study Desk — Flam Frontend Internship Assignment

Interactive **study assistant**: paste notes or a topic, get a validated JSON pack, then study with flip cards and a scored quiz. It is not a chatbot. The model never prints into a chat transcript.

Chosen idea from the brief: **Study assistant** (flashcards, quiz, re-test missed answers).

## Setup

1. Node 18+ (this repo was built on Node 26).
2. Copy env and add a free Groq key from [console.groq.com/keys](https://console.groq.com/keys):

```bash
cp .env.example .env
```

3. Install and run both the Vite app and the Express proxy:

```bash
npm install
npm start
```

Open the URL Vite prints (usually `http://localhost:5173`). The browser talks only to `/api/*`; Vite proxies those calls to `http://127.0.0.1:8787`. (The backend server on `http://127.0.0.1:8787` also serves the built frontend production bundle directly). The Groq key never ships to the client.

`npm run dev` is the same pair of processes with file watching on the server.

## Usage

1. Paste lecture notes or a short topic in the left field.
2. Build a study pack. Wait for the loading state; a timeout surfaces as an error instead of hanging.
3. Flip cards (click, tap, or Space/Enter). Arrow keys move between cards.
4. Take the quiz. After every item is answered, open results. **Retest missed** rebuilds a quiz from wrong answers only — no extra model call.
5. Optional: type a refinement (`make the quiz harder`, `add a card on glycolysis`) to edit the existing pack.
6. The last valid pack is stored in `localStorage` so a refresh does not wipe it.

## Project shape

```
src/
  components/     PromptInput, ResultView, FlashcardDeck, QuizView, ErrorState, LoadingState, EmptyState
  lib/api.ts      browser → backend only
  lib/validateResult.ts   JSON extract + structural checks before render
  types/result.ts exact pack shape
  App.tsx         request-id guard, abort, session restore
server/
  generate.ts     strict JSON prompt
  index.ts        Groq proxy; API key lives here
```

### Data shape the model must return

```json
{
  "topic": "string",
  "summary": "string",
  "cards": [{ "id": "c1", "question": "string", "answer": "string", "hint": "optional" }],
  "quiz": [{
    "id": "q1",
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "string"
  }]
}
```

`validateResult` rejects malformed JSON, missing arrays, empty usable content, and quiz items whose `correctIndex` is out of range. Those paths go to `ErrorState` with Retry. A `requestId` plus `AbortController` drop stale responses so a slow first call cannot overwrite a newer pack.

## AI-usage note

Cursor (Grok) was used to scaffold the Vite/Express layout, draft components, and iterate on copy/CSS. The JSON contract, validation rules, stale-request guard, quiz retest behavior, and backend proxy design were specified from the assignment and reviewed in the resulting code. I can walk through every file in an interview.

## Known limitations

- Needs a Groq key; there is no in-browser model fallback.
- Smaller/faster Groq models can still drift from the schema; validation will fail closed rather than guess.
- Refinement sends the whole pack back; very large notes may hit context or timeout (45s server / 50s client).
- Quiz option order is whatever the model returned; it is not reshuffled locally.
- Deployment is not included (preferred in the brief, not required).

## Time spent

About **4–5 hours** of implementation for a complete core (proxy, validation, flashcards, quiz, retest, loading/error/empty, mobile layout, refine + local save). If more time remained: stream tokens into a skeleton pack, add a second block type, and deploy the proxy.

## Stretch included (only after the core)

- Refinement loop (edit the current pack, do not always regenerate from scratch)
- Save/reload last session
- Keyboard navigation on flashcards
- Distinct study-desk visual treatment
# Flam-Assignment
