# Matcha API (Launcher Integration)

Matcha is Butter’s social layer: accounts, friends, global chat, DMs, avatars, presence, and realtime messaging.

This folder is **client-facing** documentation: everything you need to integrate Matcha into your own launcher.

## Contents

- [HTTP API](http.md)
- [WebSocket API (realtime)](websocket.md)

## Service URL

Public Matcha service:

- Info/landing page: `https://butter.lat/matcha`
- HTTP base: `https://butter.lat`
- WebSocket: `wss://butter.lat/api/matcha/ws`

If you’re integrating against a different deployment, replace `https://butter.lat` with your backend origin.

## Authentication

Most endpoints require a Matcha token:

- Send header: `Authorization: Bearer <token>`
- You obtain a token from:
  - `POST /api/matcha/register` (registration)
  - `POST /api/matcha/register/confirm` (finish two-step registration)
  - `POST /api/matcha/login` (login)

Optional (authservers):

- Matcha also supports a per-user **API token** (prefix `AM:`) for trusted authservers.
- API tokens are opt-in and are only returned when requested via `getApiToken: true`.
- When requested, the API token is rotated (one active token per user).

Common auth failures:

- `401` `{ ok: false, error: "Missing token" }`
- `403` `{ ok: false, error: "Invalid token" }`
- If the account is banned/disabled, the server returns `403` with `{ ok: false, error: "Banned", bannedUntil, reason }`.

## Key concepts

- **User ID**: 24-hex string.
- **Handle**: `Name#1234` (username + discriminator).
- **Conversations**:
  - Global chat: `with=global`
  - DMs: load by user id: `with=<otherUserId>`

## Roles, badges, and Supporter Rank

Matcha has **two parallel concepts** you can surface in the UI:

- **Role** (`user.role`): staff-like roles used for moderation/administration.
   - Typical values: `user`, `mod`, `dev`.
   - Clients normally render this as a badge/tag next to the name.
- **Supporter Rank** (`user.supporter*` fields): a separate, time-limited entitlement.
   - `supporter`: boolean flag (true if an active entitlement exists).
   - `supporterRank`: number (tier/level).
   - `supporterUntil`: ISO date string (expiry).

Notes:

- Supporter Rank is **not** the same as `role` and should not grant moderation permissions.
- In UI, it’s common to display a crown 👑 for supporters. If you want strict precedence, show staff badges (`dev`/`mod`) first, then the supporter crown.
- Supporters may have a cosmetic `supporterColor` for message styling (server may normalize/validate the value).

## Recommended integration flow

1. Register (recommended: two-step “Secure Key” flow) or login.
2. Store token securely.
   - If you request an authserver API token (`apiToken`), store it even more carefully (treat it like a password).
3. Fetch the current user: `GET /api/matcha/me`.
4. Open WebSocket and authenticate immediately: `{ "type": "auth", "token": "..." }`.
5. Pull friend state:
   - `GET /api/matcha/friends`
   - `GET /api/matcha/unread`
6. Load message history on demand:
   - `GET /api/matcha/messages?with=global&limit=30`
   - `GET /api/matcha/messages?with=<otherUserId>&limit=30`
7. Send messages:
   - Prefer WebSocket `{ "type": "send", ... }`
   - Fallback HTTP `POST /api/matcha/messages/send`
   - Multiplayer social actions are implemented as special DM commands:
     - `/invite`
     - `/request-to-join`
     - See `http.md` for “Game invites & join requests (DM protocol)” and “Join request actions”.
8. Presence:
   - Send a heartbeat periodically while the launcher is open (and optionally `offline` on exit): `POST /api/matcha/heartbeat`.
   - Send launcher-driven game/session events: `POST /api/matcha/presence/event` (game open/close, singleplayer, multiplayer connected, session left).

## Practical client notes

- Rate limits exist. If you receive `429`, back off and show “slow down”.
- Avatar caching: fetch `GET /api/matcha/avatar/<userId>?v=<avatarHash>` to bust caches when `avatarHash` changes.

## Terms of Service

- Public ToS endpoint (if enabled on the server): `GET /api/matcha/tos`

