# CoPlan

CoPlan is a shared trip-planning board for the WebMCP Challenge. A person can edit one Kyoto itinerary directly while a browser agent can use structured WebMCP tools to read, add, update, and remove the same activities. Both paths reach the same serverless API routes and the UI polls the board so changes remain visible.

## Architecture

This project uses **Next.js App Router + TypeScript** and is designed for a zero-configuration Vercel deployment. The UI lives in `app/page.tsx`, the global styles are in `app/globals.css`, the shared state and helpers are in `lib/store.ts`, and the WebMCP bridge is in `lib/webmcp.ts`.

| Route | Purpose |
| --- | --- |
| `GET /api/board` | Read the single shared board. |
| `POST /api/board` | Add an itinerary day. |
| `PATCH /api/board` | Update board metadata. |
| `DELETE /api/board/:id` | Delete an itinerary day. |
| `GET /api/activities` | Read all activities. |
| `POST /api/activities` | Add a structured activity. |
| `PATCH /api/activities/:id` | Update an activity. |
| `DELETE /api/activities/:id` | Remove an activity. |
| `GET /api/search?q=...` | Return suggested activities for a demo search. |

## WebMCP

When the browser exposes `document.modelContext`, CoPlan registers four imperative tools with `document.modelContext.registerTool()`: `get-itinerary`, `add-itinerary-item`, `update-itinerary-item`, and `remove-itinerary-item`. Their handlers call the real routes above; they do not fabricate tool responses or maintain a second client-only state.

> WebMCP is a proposed browser API that lets websites expose structured JavaScript tools to AI agents. In this demo, the agent operates on the same itinerary state the human sees.

## State and limitations

The board is intentionally stored in one in-memory JavaScript object. In a serverless environment, that object is local to a warm function instance. It can reset on a cold start, redeploy, or function replacement; this is expected for the hackathon milestone and is not intended to provide durable persistence. There is no authentication, account system, database, multi-board support, drag-and-drop ordering, or additional AI feature layer.

## Local development

```bash
pnpm install
pnpm dev
```

Run the checks with:

```bash
pnpm check
pnpm test
pnpm build
```

For the WebMCP portion, use a Chrome environment that supports the API or the official WebMCP Inspector/origin-trial flow. The local preview may display “Browser tool API unavailable” when the current browser does not expose the experimental API; the application remains usable through its human controls and real API routes.
