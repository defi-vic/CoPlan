# CoPlan

CoPlan is a shared trip-planning board for the WebMCP Challenge. A person can edit one Austin itinerary directly while a browser agent can use structured WebMCP tools to read the board, set trip details, add or remove activities, and search curated suggestions. Both paths call the same Next.js API routes and the UI refreshes the shared state.

## Architecture

CoPlan uses **Next.js App Router + TypeScript** with plain React components and plain CSS. The board is defined in `app/page.tsx`; global styling lives in `app/globals.css`; the single in-memory source of truth is `lib/store.ts`; and the client-side WebMCP bridge is `lib/webmcp.ts`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/board` | Return the full board state. |
| `PATCH` | `/api/board` | Update `destination`, `dates`, and/or `budget`. |
| `POST` | `/api/activities` | Add `{ title, cost?, notes? }`. |
| `PATCH` | `/api/activities/:id` | Update an activity. |
| `DELETE` | `/api/activities/:id` | Remove an activity. |
| `GET` | `/api/search?q=` | Return curated Austin activity suggestions. |

`spent` is recomputed from the activity costs after every store mutation. The board seeds with three activities so the demo is populated on first load.

## WebMCP tools

When `modelContext` is present on `document`, CoPlan registers these five tools in a `useEffect`: `get_trip_board`, `set_trip_details`, `add_activity`, `remove_activity`, and `search_activities`. Each `execute()` calls the real API route and returns `{ content: [{ type: "text", text: "..." }] }`. Registration is feature-detected, and an `AbortController` plus unregister cleanup is used on unmount. Unsupported browsers show a **WebMCP tools not detected** status without throwing.

> WebMCP lets a browser page expose structured JavaScript tools to an AI agent. In this demo, the agent and the human edit the same live board rather than maintaining separate simulated results.

## State limitation

The board is intentionally one in-memory JavaScript object. In Vercel’s serverless environment, memory belongs to a warm function instance and may reset on a cold start, redeploy, or function replacement. This reset behavior is expected for the hackathon milestone; there is no database, authentication, account system, persistence layer, multi-board support, or external search call.

## Local development and verification

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

For the WebMCP demo, open the site in a Chrome environment where WebMCP testing is enabled, such as `chrome://flags/#enable-webmcp-testing`, or use the official WebMCP Inspector/origin-trial flow. In ordinary browsers the board remains fully usable through its human controls while the status badge reports that the browser tool API was not detected.
