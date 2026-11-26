# M49 — Backend and Moderation Operations Decision

**Decision record:** M49-ADR-01  
**Status:** Recommended architecture selected; production jurisdiction and named operators unresolved  
**Date:** 2026-11-27  
**Applies to:** Visitor Memory Exchange v1  
**Important:** No service has been provisioned. This record does not enable submissions or change the static site's runtime.

## 1. Decision summary

Select **Supabase Pro (PostgreSQL + Edge Functions + Supabase Auth)** as the preferred backend for M49 v1, subject to jurisdiction and operator approval.

Use Supabase Auth only for invited moderators and technical operators. Contributors remain account-free and anonymous. Use Postgres for the private queue, public approved records, withdrawal state and moderation audit events. Use Edge Functions as the only public write interface and the only administrative action interface.

Do not use Supabase Storage, Realtime, public visitor accounts, public pseudonyms, or analytics for v1. M49 accepts plain text only. The existing GitHub Pages/static archive must continue to work when the exchange API is down or deliberately disabled.

**This is a technical vendor decision, not a legal/data-region decision.** Do not create a production project until the responsible legal operator, applicable jurisdiction, data region and provider DPA/subprocessors have been reviewed.

## 2. Backend comparison

| Candidate | Advantages for M49 | Material concerns | Decision |
| --- | --- | --- | --- |
| **Supabase Pro** | Managed PostgreSQL; one region selected for project database/Auth/storage; Edge Functions; Auth TOTP MFA; Postgres RLS; simple private queue and retention jobs | Region selection does not guarantee every support/operations flow stays there; Edge Function logging and request metadata need configuration review; custom anonymous-submission abuse controls still need to be built | **Preferred** |
| Cloudflare Workers + D1 + Access | Worker and D1 are a compact static-site-adjacent stack; D1 supports EU/US jurisdiction constraints; built-in Time Travel recovery | Workers need Regional Services for regional execution; database jurisdiction cannot be changed after creation; Cloudflare's simple Worker rate-limit binding is approximate and per location; a custom moderator console, roles and audit workflow still need implementation | Viable alternative if Cloudflare is already the chosen domain/security operator |
| Firebase / Firestore | Mature managed service, App Check can reject unverified app requests | More document/rules-specific architecture for the moderation state machine; still requires custom moderation UI, retention and server-side deletion workflows | Not selected |

### Why Supabase

M49 is a small relational workflow, not a social network. Postgres gives explicit lifecycle state, transactions, retention queries and relational audit records. Supabase combines this with a selected project region and TOTP MFA for staff. The Pro plan currently starts at **USD 25/month** for the first project and includes daily backups retained for 7 days and 7-day log retention. Pricing and included compute/usage must be rechecked at provisioning.

The Team plan is not recommended merely to obtain platform audit logs. Instead, v1 should maintain a narrowly scoped append-only application moderation ledger. Supabase Platform Audit Logs are a separate feature currently listed for Team and Enterprise plans; those plans should only be considered if the operator later requires that platform-level feature or other Team controls.

## 3. Region and data-residency gate

Supabase's exact project region is selected at project creation and cannot be changed in place. A move requires a new project and migration. Therefore, the region must be chosen before provisioning.

Use an **exact region**, not a broad “Europe” grouping:

- If the accountable operator and legal review determine that EU hosting is appropriate, evaluate **Frankfurt (eu-central-1)** as the default.
- If Swiss hosting is required and legally appropriate, evaluate **Zurich (eu-central-2)**.
- For another jurisdiction, select the exact region only after confirming the local controller, transfer rules and provider availability.

Supabase documents that the chosen region covers the primary project data, but also identifies support and operational processing by other Supabase entities and subprocessors outside the selected region. A regional database is therefore not a promise that every administrative, support, telemetry or legal process is confined to that region. Review the current DPA, subprocessor list, transfer terms and operational logs before approval.

No country or region is selected by this record. The project operator and applicable law have not been formally identified.

## 4. Supabase deployment profile

### Products enabled

- PostgreSQL database.
- Edge Functions, invoked in the same region as the project database for database-intensive operations.
- Supabase Auth for invited staff accounts only, with TOTP MFA required and AAL2 enforced for moderation actions.
- RLS on every exposed table/view. Private tables and functions remain outside public exposed schemas wherever possible.

### Products disabled / not used

- Public visitor sign-up, anonymous auth identities, social login and public profiles.
- Supabase Storage and any visitor media upload.
- Realtime subscriptions.
- Third-party analytics and advertising pixels.
- Log drains and external observability vendors unless separately privacy-reviewed.
- Point-in-Time Recovery for v1 unless its extended copy-retention consequences are reviewed and disclosed.

### API boundary

The browser must never receive a secret/service-role key. Public clients receive only the publishable key, which grants no authority without the corresponding database policy. All submission, withdrawal, report and moderation writes pass through server-side Edge Functions. Secret keys remain in Supabase's server-side secrets store.

The public read function returns only PUBLISHED records and only public fields. It must never expose pending, rejected, quarantined, withdrawn, expired or removed records. The admin console may be a static interface, but every protected action is authorized again on the server; hiding a route or button is not access control.

### Planned functions

| Function | Caller | Responsibility |
| --- | --- | --- |
| exchange-public | Public | Return a bounded, paginated list of PUBLISHED fragments only |
| exchange-submit | Public | Validate consent, text length, allowed fields, archive ID, anti-abuse checks and queue capacity; create PENDING record |
| exchange-withdraw | Public with one-time key | Verify key, immediately suppress contribution and initiate deletion |
| exchange-report | Public | Accept a bounded fixed-category report without creating public discussion |
| exchange-moderation | Authenticated moderator at AAL2 | List private queue; approve, reject, quarantine, remove or expire |
| exchange-maintenance | Restricted operator at AAL2 | Close intake, inspect queue counts, run controlled retention and backup/restore procedures |

The functions are a planned contract, not existing deployed endpoints.

## 5. Database shape and access rules

Use a private schema for internal workflow data. Initial logical entities:

- contributions: opaque random public ID, body, optional allowlisted archive ID, fixed category, state, submitted/published/expiry timestamps, consent version, withdrawal-key verifier and deletion state.
- moderation_events: append-only action records with staff actor ID, target opaque ID, action, fixed reason code, timestamp and optional second-review reference. Do not copy contribution text into this table.
- reports: target opaque ID, fixed reason category, bounded optional explanation, created time and triage state. Reporters have no public identity.
- moderator_roles: server-controlled role assignments. Role claims must not be derived from visitor-editable user metadata.
- rate_limit_buckets: short-lived, privacy-minimised counters only if trusted request metadata is available and the implementation passes review.
- deletion_tombstones: opaque record ID and deletion timestamp used by the controlled restore process. Do not store the contribution body or withdrawal key here.

Public reads use a purpose-built safe view or Edge Function response. Do not grant public clients direct access to the internal queue. A table in an exposed schema must not be assumed safe merely because it currently has no policy; grants and RLS must both be reviewed. Avoid SECURITY DEFINER SQL functions in exposed schemas. If one is unavoidable, pin search_path, schema-qualify names, restrict EXECUTE and add adversarial database tests.

Never place the Supabase service-role/secret key in index.html, JavaScript, GitHub Actions artifacts, or a public repository secret accidentally echoed to logs.

## 6. Moderation organisation

### Minimum people and roles

M49 requires **at least two named human reviewers** before intake can open.

| Role | Authority | Not permitted |
| --- | --- | --- |
| Project steward / privacy owner | Owns the public rules, legal/operator decisions, privacy contact, retention and service shut-off decision | Must not treat GitHub/repository access as a moderation credential |
| Moderation lead | Reviews routine submissions, approves or rejects, quarantines, unpublishes, coordinates reports and trains the backup | Cannot change database policy, MFA enforcement or retention configuration through the moderation UI |
| Backup reviewer | Covers absences and performs second review for ambiguous/high-risk cases | Cannot change service ownership or grant moderator roles |
| Technical operator | Maintains schema, Edge Functions, secrets, database backups, access and incident tooling | Does not automatically receive moderation approval authority merely by being a developer |

The same person may initially be project steward and technical operator, but at least two people must be available for moderation. High-risk or ambiguous material requires two-person review. No one may approve their own contribution. If only one reviewer is available, the exchange remains closed.

Named people, a real privacy contact and an actual service operator are **not yet assigned**. Do not fabricate a contact address or publish an unmonitored social account as the privacy route.

### Review cadence and public expectation

Proposed v1 operating schedule:

- Two scheduled moderation sessions per week, with a target decision within 7 calendar days.
- Every contribution stays private until a human decision.
- A second reviewer is required for ambiguous or high-risk material, third-party personal data, credible threats, possible non-consensual content or copyright uncertainty.
- Reports are checked during each scheduled session. State plainly that the service is not monitored continuously and is not an emergency response channel.
- If review capacity is unavailable for more than 7 days, close new intake and show a neutral “contributions paused” message.
- Close intake automatically at 25 pending submissions; reopen only after the backlog is below 10 and a moderator confirms capacity.
- Pending submissions older than 30 days are deleted automatically.

These are operating targets, not a promise of 24/7 safety monitoring. The named operators must confirm that they can meet this schedule before launch.

### Moderation decisions

Routine low-risk material may be approved by one moderator. A moderator may reject without a second reviewer. Quarantine, sensitive cases, restoration after an incident and overrides to an earlier decision require a second reviewer. Every decision uses a fixed reason code and produces an append-only moderation event. Moderators may not rewrite the contributor's text and publish it as if it were unchanged.

## 7. Staff authentication and access

- Disable all public sign-up and provider login methods not needed for moderators.
- Invite each moderator individually; no shared moderation account.
- Require TOTP MFA. Moderation endpoints check verified AAL2, not merely that a user is signed in.
- Require a separate server-side role lookup for every moderator action. Do not trust user_metadata, client-supplied role names or a hidden admin URL.
- Use least-privilege roles: reviewer, moderator lead and technical operator.
- Revoke access promptly when a person leaves the role; rotate affected secrets after suspected compromise.
- Keep organization owner access to the smallest practical set of people and protect it with MFA and recovery procedures.
- Keep the application action ledger separate from provider authentication logs. Log actor, action, target ID, reason code and result; do not log the submitted body, withdrawal key, raw network address or full request headers.

## 8. Retention, backups and deletion

Use the M49 privacy design's retention schedule: pending 30 days; rejected 30 days after decision; published 180 days; network-abuse buckets 24 hours; moderation action metadata 12 months. The selected Supabase Pro baseline offers 7-day daily backups and 7-day platform log retention. Verify these settings and the current plan before provisioning.

For v1:

- Do not enable PITR or create unmanaged manual exports containing contribution bodies.
- Delete pending/rejected/expired/withdrawn text from the primary database on schedule.
- Immediately suppress a withdrawn/removed record from all public read paths; do not wait for the daily retention job.
- Keep only a minimal opaque deletion tombstone long enough to prevent accidental republication after a database restore.
- Never restore a production backup directly to public traffic. Restore into an isolated environment, replay deletion tombstones recorded after the backup point, run queue/public-view integrity tests, then re-enable public reads.
- Document the backup expiry window clearly. A live deletion cannot recall independent copies already downloaded or cached by third parties.

The technical operator must prove the restore-and-tombstone procedure in staging before launch.

## 9. Intake and abuse controls

- Server-side body limit: 500 Unicode characters after normalization; reject invalid encoding and unexpected JSON keys.
- Allow only a fixed category list and a server-maintained allowlist of existing archive IDs.
- Render plain text with HTML escaping. No Markdown, HTML, SVG, URLs, embeds or file inputs.
- Explicit consent is required for each submission; keep the consent text version and timestamp as minimal evidence.
- Generate a 256-bit random withdrawal key. Show it once after success. Store only a keyed verifier (HMAC-SHA-256 with a server-held secret) and compare in constant time. Never put the key in URL, analytics or logs.
- Implement per-action rate limits and queue caps server-side. Confirm which trusted client address metadata the deployed gateway actually supplies; never trust arbitrary X-Forwarded-For values from the browser.
- If using a rotating network bucket, derive a keyed HMAC from a trusted proxy address and rotate the secret on a short schedule. Keep only the bucket and expiry needed for abuse control; delete it after 24 hours and never persist the raw address.
- If Supabase alone does not provide a trustworthy, low-retention source for network abuse control, add an explicitly reviewed ingress rate-limit layer before public launch rather than inventing a header-based IP check.
- A challenge provider such as Turnstile is optional, not assumed. Review its data flows and accessibility before adding it.
- If intake is overloaded, storage fails, the abuse-control layer is unavailable or queue limits are reached, fail closed for new submissions while public reading and the rest of the machine continue.

## 10. Operational runbook

### Each review session

1. Confirm intake is enabled and the queue is below the configured cap.
2. Review oldest pending fragments first.
3. Check text for identifying information, threats, harassment, non-consensual content, copyright issues, spam and malicious instructions/links.
4. Approve, reject or quarantine with a fixed reason code; obtain a second reviewer when required.
5. Review report queue and withdrawal requests.
6. Check oldest pending age and review workload; close intake if staffing is insufficient.
7. Confirm the public endpoint serves only approved records.

### Weekly

- Review access changes, MFA status, failed moderator access and unusual action volume.
- Verify scheduled retention job completion and that old network buckets are gone.
- Check provider log settings and confirm submitted text and deletion keys are absent.
- Confirm public records nearing 180 days are queued for expiry/re-review.
- Review queue-cap and abuse-rate trends without creating individual visitor profiles.

### Incident response

For a suspected exposure, compromised account, doxxing or non-consensual content: immediately disable intake; remove the affected fragment from public reads; revoke affected sessions/secrets; preserve only the minimum incident evidence; engage the named privacy owner; determine whether provider/legal notifications are required; and document resolution. Do not publish an incident narrative that repeats the personal information.

## 11. Cost and operational fit

The current Supabase pricing page lists Pro from **USD 25/month** for the first project and includes 7-day daily backups and 7-day log retention. Usage, compute, egress, email or optional add-ons may add cost. M49 v1 does not need file storage, realtime, transactional email or third-party log drains.

The Team plan is currently listed from USD 599/month and adds features such as platform audit logs and SSO. It is not justified solely to obtain an application moderation ledger; use a tested app-level append-only ledger for v1 unless another requirement changes the decision.

Recheck live plan prices and limits before provisioning. Do not enable a paid subscription until the project steward has explicitly accepted the recurring cost and vendor terms.

## 12. Provisioning / launch gates

The following decisions must be recorded before production setup:

- [ ] Name the legal/project operator and data controller (or equivalent accountable entity).
- [ ] Confirm applicable jurisdiction and choose the exact Supabase region.
- [ ] Review and accept the Supabase DPA, current subprocessor list, support/operations data flows and any international transfer terms.
- [ ] Confirm the Pro recurring price and usage/compute budget.
- [ ] Name moderation lead and backup reviewer; verify twice-weekly capacity.
- [ ] Create the real privacy/safety contact route and publish monitored service hours.
- [ ] Create the Supabase project with an exact region, then verify actual region and platform configuration.
- [ ] Disable public auth sign-up and enable individual staff MFA.
- [ ] Implement database schema, RLS tests and server-side Edge Functions.
- [ ] Verify request metadata / rate limiting without retaining raw IPs or contribution bodies in logs.
- [ ] Prove withdrawal, retention, backup expiry and restore/tombstone replay in staging.
- [ ] Test abuse, spam floods, cross-site attacks, moderator account compromise and public-feed isolation.
- [ ] Approve final visitor consent, publication licence, privacy notice and content policy.
- [ ] Keep M49 closed until all checks pass.

## 13. Immediate next actions

1. The project owner identifies the accountable operating entity and intended data jurisdiction.
2. The project owner confirms acceptance of Supabase Pro pricing and its DPA/subprocessor model.
3. Two moderators are named and the review schedule is accepted.
4. Only then create the region-specific project and implement the schema/functions in a separate M49 backend branch.

Until those inputs are confirmed, the static archive remains the only active experience and M49 intake remains disabled.

## 14. Primary technical references

- Supabase available regions: https://supabase.com/docs/guides/platform/regions
- Supabase data residency and transfers FAQ: https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
- Supabase pricing: https://supabase.com/pricing
- Supabase database backups: https://supabase.com/docs/guides/platform/backups
- Supabase TOTP MFA: https://supabase.com/docs/guides/auth/auth-mfa/totp
- Supabase MFA enforcement in RLS: https://supabase.com/docs/guides/auth/auth-mfa
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Edge Function authentication: https://supabase.com/docs/guides/functions/auth
- Supabase Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- Cloudflare D1 data location: https://developers.cloudflare.com/d1/configuration/data-location/
- Cloudflare Workers Regional Services: https://developers.cloudflare.com/data-localization/how-to/workers/
- Cloudflare Workers rate limiting limitations: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

This is an engineering decision record. It does not replace legal advice or the final operator-specific privacy review.
