# LostFound+ — Frontend wired to the real backend

This frontend now talks to your Express + MongoDB backend
(`LostFound-plus/server.js` and `routes/*.js`) instead of localStorage/mock data.

## Setup

1. **Backend** (unchanged, from your `LostFound-plus.zip`):
   ```
   cd LostFound-plus
   npm install
   node server.js        # or: npx nodemon server.js
   ```
   Make sure `.env` has a working `MONGO_URI`, `JWT_SECRET`, and Cloudinary keys.
   It listens on `PORT` from `.env` (defaults to 5000 if unset).

2. **Frontend** (this project):
   ```
   cp .env.example .env
   # edit .env if your backend isn't on http://localhost:5000
   bun install    # or: npm install
   bun run dev    # or: npm run dev
   ```

## What changed

- `src/lib/store.js` — rewritten as a real API client (fetch-based) for
  `/api/auth/*`, `/api/items*`, and `/api/upload`. JWT is stored in
  `localStorage` and attached as `Authorization: Bearer <token>`.
- Added `/login` and `/register` routes (your backend requires auth to create
  items, but had no frontend pages for it).
- `report.jsx` now uploads the photo to `/api/upload` (Cloudinary) first, then
  `POST /api/items` with the returned `imageUrl`.
- `search.jsx` now calls `GET /api/items` with real query params
  (`type`, `category`, `location`, `status`, `search`).
- `item.$id.jsx` fetches the real item. If you're the reporter, you get
  inline **status / claim status** dropdowns and a **delete** button
  (`PUT`/`DELETE /api/items/:id`) — since your backend only lets the
  reporter update their own item.
- `dashboard.jsx` shows your real reports (`GET /api/items`, filtered
  client-side by `reportedBy`, since there's no `?mine=1` param yet).
- Field names now match your Mongoose model exactly: `title` (not `name`),
  `imageUrl` (not `image`), lowercase `type` (`lost`/`found`) and `status`
  (`open`/`matched`/`claimed`/`resolved`) to match your schema enums.

## One thing your backend doesn't support yet: claims

Your `Item` model has `claimStatus` / `claimedBy` fields, but there's no
`Claim` collection or `/api/claims` routes — and the existing `PUT /api/items/:id`
route only allows **the reporter** to update those fields (see the ownership
check in `routes/items.js`). So someone claiming a lost/found item that
*isn't* theirs currently has no way to write anything to MongoDB.

Until you add that endpoint, `/claim/:id` does the next best thing:
1. Saves the claim to the claimant's own browser (`localStorage`), shown on
   their **My Claims** dashboard tab (clearly labeled as device-local).
2. Opens a pre-filled `mailto:` to the reporter's email with the claim
   details, so the reporter actually gets notified.

To make this fully server-backed, add a `Claim` model + `POST /api/claims`
(claimant submits) + `GET /api/claims/my` + a `PATCH` the reporter can call
to approve/reject — then swap `saveClaimLocal`/`listMyClaimsLocal` in
`src/lib/store.js` for real requests. I kept the swap-over comment right
above those two functions.
