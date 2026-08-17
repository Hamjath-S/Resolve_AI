# ResolveAI — React Frontend

React + Vite frontend for ResolveAI. Talks to your existing FastAPI backend over HTTP;
does not touch the Gemini API key or any backend code.

## Setup

```bash
npm install
cp .env.example .env      # then edit .env if your backend URL differs
npm run dev
```

Opens at `http://localhost:5173`. The backend URL is read from `VITE_API_URL` at build
time (see `.env.example`) — nothing is hard-coded, and no API key is stored anywhere
in this project.

## Required backend endpoint

The frontend already calls `GET /health` (confirmed to exist) to show a live
connection indicator in the header.

It also calls **`POST /analyze`**, which does not exist on your backend yet. Add this
to your FastAPI app to wire the "Analyze Incident" button to Gemini:

**Request**
```
POST /analyze
Content-Type: application/json

{
  "id": 101,
  "title": "Login failure",
  "description": "Users cannot log into the application.",
  "priority": "High",
  "status": "Open"
}
```

**Response** — the frontend renders these four fields (`src/components/AnalysisResult.jsx`):
```json
{
  "category": "Authentication",
  "priority": "High",
  "root_cause": "Session tokens are expiring prematurely due to a clock skew between auth servers.",
  "recommendation": "Resync NTP on all auth nodes and reissue tokens with a 15-minute grace window."
}
```

If your Gemini response comes back as a single free-text block instead of these four
fields, parse/split it into this shape server-side before returning it — that keeps
all AI-shape decisions in the backend and the frontend simple.

Until `/analyze` exists, submitting the form will show a clear "Endpoint not
connected" error naming the missing route — the UI is fully functional for that state
so you can build and test everything else independently.

## Project structure

```
src/
  components/
    Header.jsx          Top bar: logo, tagline, live backend status (GET /health)
    Badges.jsx           PriorityBadge / StatusBadge — color-coded pill labels
    IncidentForm.jsx      Incident input form + client-side validation
    AnalysisResult.jsx    Renders category / priority / root cause / recommendation
    StatePanels.jsx       Loading spinner, empty state, error banner
  pages/
    Dashboard.jsx         Composes the two cards, owns request state (idle/loading/success/error)
  services/
    api.js                All backend calls live here: checkBackendHealth(), analyzeIncident()
  App.jsx                 Root layout, polls backend health every 15s
  main.jsx                React entry point
  index.css               Design tokens + all styling (no CSS framework)
```

## Error handling covered

- **Backend unavailable** — fetch throws → "Backend unavailable" banner naming the URL.
- **Endpoint missing (404)** — distinct message telling you to add `POST /analyze`.
- **API error (non-2xx)** — surfaces the backend's `detail`/`message` field if present.
- **Empty incident data** — client-side validation blocks submission before any request is sent.
- **Network/timeout** — 30s timeout on the analysis call, 5s on the health check.

## Notes on choices

- **JavaScript, not TypeScript** — kept the toolchain minimal per "no unnecessary
  libraries"; there's no shared type contract with the backend yet (the `/analyze`
  endpoint doesn't exist), so TS would mostly add ceremony right now. Swap in `tsc`
  and `.tsx` later if you want it once the contract is stable.
- **`fetch`, not axios** — one less dependency; the API surface here is small enough
  that native `fetch` (with `AbortSignal.timeout`) covers it.
- **No CSS framework** — plain CSS with design tokens in `index.css`, kept
  component-scoped by class naming rather than pulling in Tailwind/MUI for a
  ten-component dashboard.
