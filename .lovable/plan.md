# AI SMS check-ins for property owners

Fully automated two-way SMS: AI drafts and sends outbound check-ins to property owners; inbound replies trigger AI-powered create/edit/complete/delete of tasks and events for that owner's properties — no human review step.

## Prerequisites

1. **Enable Lovable Cloud** (database, cron, server functions, secrets).
2. **Connect Twilio** via the Twilio connector (you'll provide Account SID + API Key + a Twilio phone number with SMS enabled).
3. Lovable AI Gateway (no setup — `LOVABLE_API_KEY` is auto-provisioned). Model: `google/gemini-3-flash-preview`.

## Data model changes

- `owners` table — id, name, phone (E.164), email, sms_opt_in, timezone, created_by.
- `properties.owner_id` — link each property to one owner (nullable for now; you assign in UI).
- `sms_messages` table — id, owner_id, direction (`inbound`/`outbound`), body, twilio_sid, status, created_at. Full conversation log so the AI has context on replies.
- `sms_preferences` table (per owner) — daily_digest (bool + hour), weekly_summary (bool + day/hour), overdue_alerts (bool), event_reminder_hours (int, e.g. 24).

All tables: RLS so owners' creator (you) can read/write; service role used by server functions for cron + webhook.

## Outbound: 4 triggers

A single scheduled server function `runSmsTriggers` runs every 15 min via pg_cron, checks each owner's preferences + local time, and for each due trigger:

1. Pulls relevant context (overdue tasks, upcoming events, recent completions) for that owner's properties.
2. Calls Lovable AI to draft a short, friendly SMS (≤320 chars, includes property names).
3. Sends via Twilio gateway, logs in `sms_messages`.

Triggers:
- **Daily digest** — at owner's preferred hour, summarize today's tasks + overdue.
- **Weekly summary** — once/week, roll-up of completions + what's upcoming.
- **Task overdue** — when a task crosses its due date (debounced: max 1 overdue alert per task per 24h).
- **Upcoming event reminder** — N hours before event start.

## Inbound: two-way AI

- Public route `/api/public/sms/twilio-webhook` receives Twilio POST.
- Verifies Twilio signature (HMAC) → rejects unsigned requests.
- Looks up owner by `From` phone. Unknown number → polite "not recognized" reply.
- Loads last ~10 messages in that conversation + owner's properties + open tasks/events as context.
- Calls Lovable AI with **tool calling** (full CRUD tools):
  - `create_task`, `update_task`, `complete_task`, `delete_task`
  - `create_event`, `update_event`, `delete_event`
  - `list_tasks`, `list_events` (for "what's open at X?" questions)
- AI executes tools against DB scoped to that owner's properties (server-side authorization — owner can only touch their own properties).
- AI's final reply is sent back via Twilio and logged.

## UI changes

- **Owners page** (new) — list/add/edit owners, phone numbers, SMS opt-in toggle, per-owner preference panel.
- **Property edit** — assign owner dropdown.
- **SMS conversation viewer** (per owner) — read-only thread of all inbound/outbound messages, plus a "Send test message" button.

## Safety guardrails

- STOP / UNSUBSCRIBE keywords → flip `sms_opt_in=false`, send confirmation.
- Owner can only affect their own properties' tasks/events (enforced in tool handlers, not just the prompt).
- Destructive actions (delete) logged with the originating SMS for audit.
- Rate limit: max 5 outbound SMS per owner per day to prevent loops/spam.
- Twilio Geo Permissions + SMS Pumping Protection — I'll remind you to enable these in Twilio console after connecting.

## Technical details

- Server functions in `src/lib/sms.functions.ts` (cron entrypoint, send helper) — admin-scoped, called only by cron route.
- Webhook in `src/routes/api/public/sms/twilio-webhook.ts`.
- AI tool definitions in `src/lib/sms-tools.server.ts` using AI SDK `tool()` + Zod schemas, `stopWhen: stepCountIs(50)`.
- pg_cron schedules call a server route `/api/public/cron/sms-triggers` with a shared secret header.
- Twilio calls via connector gateway (`https://connector-gateway.lovable.dev/twilio/Messages.json`).

## Build order

1. Enable Cloud + connect Twilio.
2. Schema migration (owners, sms_messages, sms_preferences, properties.owner_id).
3. Owners UI + property-owner assignment.
4. Twilio send helper + test-message button (verify outbound works end-to-end).
5. Inbound webhook + AI tool calling (verify two-way works).
6. Cron triggers (daily/weekly/overdue/event reminder).
7. SMS conversation viewer + opt-in/STOP handling.
