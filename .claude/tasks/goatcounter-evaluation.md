# GoatCounter Evaluation

**Date:** 2026-02-20
**Repository:** [arp242/goatcounter](https://github.com/arp242/goatcounter) — 5.5k stars, Go, EUPL license

## Questions Investigated

1. Does GoatCounter have a batch record API?
2. Does it have a GET method for different users and total count?
3. If not, what's the effort to implement them?

---

## 1. Batch Record (POST multiple hits)

**Status: Already exists**

`POST /api/v0/count` accepts up to 500 pageviews per request in a `hits` array. Pageviews are buffered in `memstore` and persisted to DB every 10 seconds. Requires Bearer token auth with higher rate limits than the JS integration (4 req/s).

```json
{
  "no_sessions": true,
  "hits": [
    {"path": "/one", "title": "Page One"},
    {"path": "/two", "title": "Page Two", "event": true}
  ]
}
```

Each hit supports: `path` (required), `title`, `event`, `ref`, `size`, `query`, `bot`, `user_agent`, `location`, `ip`, `created_at`, `session`.

**Current project usage:** `useGoatCounter.ts` uses the client-side JS `count.js` script (`window.goatcounter.count()`) which sends one hit at a time — it does NOT use the batch API.

---

## 2. GET Methods for Counts

### Total Count: Available

- `GET /api/v0/stats/total` — total visitors for a date range (with events breakdown)
- `GET /api/v0/stats/hits` — visitor stats per path, paginated (supports `include_paths`, `exclude_paths`, `path_by_name`)
- `/counter/{path}.json` — public endpoint returning `count` and `count_unique` for a single path (no auth needed)

### Batch GET (multiple paths at once): Not directly available

No single endpoint to fetch counts for multiple paths in one request. The `stats/hits` API can filter by `include_paths` but requires Bearer token auth (not suitable for client-side use without a proxy).

**Current project usage:** `getVisitCountOnly()` fetches `/counter/{path}.json` one path at a time. `getBlogAnalytics()` fires 3 separate requests per blog card (visits, likes, shares).

### Per-User Analytics: Not available (by design)

GoatCounter is privacy-first and does not track individual users:
- Sessions are `hash(siteID + User-Agent + IP)` → random UUID
- IP and User-Agent are never persisted to disk — only held in memory for 8 hours
- No concept of user accounts or user IDs in analytics data
- Cannot query "how many times did user X visit" or "which users visited page Y"

---

## 3. Effort Estimates

### A. Batch GET for multiple path counts

| Approach | Effort | Notes |
|---|---|---|
| Server-side proxy using `GET /api/v0/stats/hits?include_paths=...&path_by_name=true` | **Low** (~0.5-1 day) | Needs a BFF/proxy to hide Bearer token from browser |
| Fork GoatCounter: add `POST /api/v0/counter/batch` endpoint | **Medium** (~2-4 days) | Query infra already exists in `hit_stats.go` / `hit_list.go`; adapt `countTotal` or `hits` handler |
| Client-side workaround (current approach with queue + cache) | **Already done** | Queue rate-limiting in `useGoatCounter.ts`; could add stale-while-revalidate |

### B. Per-User Tracking

| Approach | Effort | Notes |
|---|---|---|
| Fork GoatCounter to add user identity | **Very High** (weeks) | Add user-identity column to `hits` table, modify session logic, new API endpoints, new indexes. Goes against GoatCounter's core privacy model. |
| Separate backend/database for per-user actions | **Medium** (~2-3 days) | Keep GoatCounter for aggregates; use own DB for likes/shares per user. Already partially done with `localStorage` in `LikeButton.vue`. |

---

## 4. Recommendations

1. **Batch reads:** Add a lightweight server-side proxy (Nuxt server route or API middleware) that calls `GET /api/v0/stats/hits` with `include_paths` + `path_by_name=true` using the Bearer token. This eliminates N+1 requests from the blog listing page without forking GoatCounter.

2. **Recording hits:** Current JS-based recording (`count.js`) is fine for page visits. For server-side events or more control, switch to the batch `POST /api/v0/count` endpoint.

3. **Per-user features:** Do not bend GoatCounter for per-user tracking. Use a separate persistence layer (e.g., a simple API + DB table) for features like "which posts did user X like." The current `localStorage` approach in `LikeButton.vue` works for single-device UX but won't persist cross-device.

---

## 5. Relevant Source Files (GoatCounter)

| File | Purpose |
|---|---|
| `handlers/api.go` | All API route definitions and handler implementations |
| `handlers/count.go` | The `/count` JS endpoint (non-API) |
| `memstore.go` | In-memory hit buffer before DB persistence |
| `hit.go` | Hit model and validation |
| `hit_list.go` | HitList queries (used by `stats/hits` API) |
| `hit_stats.go` | Aggregated stats queries (browser, system, etc.) |
| `cron/` | Background persistence and stats regeneration |

## 6. Relevant Source Files (This Project)

| File | Purpose |
|---|---|
| `composables/useGoatCounter.ts` | All GoatCounter integration logic (tracking, fetching counts, caching, queue) |
| `components/ui/VisitCounter.vue` | Displays visit count for a path |
| `components/blog/LikeButton.vue` | Like button with localStorage persistence and cooldown |
| `components/blog/BlogCard.vue` | Blog card that fetches analytics (visits, likes, shares) |
| `plugins/goatcounter-cleanup.client.ts` | Client plugin for GoatCounter cleanup |
| `deploy/helmfile/goatcounter/` | Helm chart for self-hosted GoatCounter deployment |
