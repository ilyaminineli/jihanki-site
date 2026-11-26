# M49 — Backend and moderation-operations decision

**Decision date:** 2026-11-27  
**Decision status:** Preferred backend selected; operational owners and account provisioning remain open  
**Release status:** NOT OPEN FOR PUBLIC SUBMISSIONS

This is an architecture and operations decision record, not proof that a provider account, project, database, moderator console or legal agreement has been created.

## 1. Decision

Use **Supabase Pro with the project in eu-central-1 (Central EU / Frankfurt)** as the preferred M49 v1 backend.

Use only:

- Supabase PostgreSQL for private submissions, moderation states, deletion/withdrawal records and a minimal moderation audit.
- Supabase Auth for invite-only moderator identities.
- Supabase Edge Functions for the only public-facing submission, withdrawal and published-feed interfaces, and for authenticated moderation actions.
- Row Level Security (RLS) and explicit server-side role checks.

Do not enable Supabase Storage, Realtime, public table writes, public table reads, third-party analytics, or a visitor account system in v1. Do not deploy the contribution form until the release gates in section 8 are met.

The public JIHANKI website remains hosted as a static site. M49 is an optional remote subsystem, loaded only when a visitor explicitly opens the exchange. If the exchange is unavailable, the rest of the archive works normally.

## 2. Provider comparison

| Candidate | Strengths for M49 | Costs / trade-offs | Decision |
| --- | --- | --- | --- |
| **Supabase Pro, Frankfurt** | Managed PostgreSQL, Auth, Edge Functions, MFA support, RLS, region-selected primary database and backups. Edge Functions can be pinned to Frankfurt. | From US$25/month. Pro includes 7-day daily backups and 7-day platform-log retention. Supabase documents limited processing outside the selected region for account operations, support and telemetry. | **Selected as the preferred v1 target.** Lowest custom operational surface for a small text-only moderation system. |
| Cloudflare Workers + D1 (EU jurisdiction) + Access | D1 can be restricted to the EU; Workers Paid starts at US$5/month; D1 Time Travel provides 30-day point-in-time recovery on Workers Paid. Cloudflare Access can protect a private moderation console and enforce MFA. | Requires custom moderator identity/role system, queue UI, audit trail, deletion workflow and more infrastructure code. D1 jurisdiction constrains the database, not necessarily the Worker execution location. Cloudflare's Data Localization Suite for traffic processing and metadata/log boundaries is an Enterprise-only add-on. | Viable lower-cost fallback if a dedicated Cloudflare operations stack is preferred, but not selected for v1. |
| Firebase / other BaaS | Mature managed products and authentication options. | Would need a separate data-location, backup, logging and moderator-access review; no demonstrated advantage over the chosen Postgres/Auth/Functions combination for a tiny text-only queue. | Not selected. |

### Current provider facts to recheck before purchase

- Supabase Pro is advertised from **US$25/month**. Its current pricing page lists daily backups retained for 7 days and platform logs retained for 7 days. Price excludes taxes and any usage or configuration beyond the included plan allowances.
- Supabase says the primary Postgres database, Auth service, Storage objects and backups live in the selected AWS region. Its residency FAQ also says some account, support and telemetry processing may occur outside that selected region; logs are ingested and stored in EU data centres. This is not a promise of absolute single-region processing.
- Supabase supports regional Edge Function invocation, including eu-central-1 (Frankfurt).
- Cloudflare Workers Paid has a US$5/month minimum. D1 uses usage-based rows-read, rows-written and storage pricing. Workers Paid currently provides 30 days of D1 Time Travel.
- Cloudflare D1 supports an EU jurisdiction constraint for the database. Cloudflare states that the Data Localization Suite is an Enterprise-only paid add-on for controls over traffic processing, encryption-key geography and customer metadata/log boundaries.

Provider references (verify again before activation):
- Supabase regions: https://supabase.com/docs/guides/platform/regions
- Supabase data residency and transfers FAQ: https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
- Supabase regional Edge Functions: https://supabase.com/docs/guides/functions/regional-invocation
- Supabase security / RLS and secret keys: https://supabase.com/docs/guides/database/secure-data
- Supabase MFA: https://supabase.com/docs/guides/auth/auth-mfa
- Supabase pricing: https://supabase.com/pricing
- Supabase backups: https://supabase.com/docs/guides/platform/backups
- Cloudflare D1 data location: https://developers.cloudflare.com/d1/configuration/data-location/
- Cloudflare D1 Time Travel: https://developers.cloudflare.com/d1/reference/time-travel/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Data Localization Suite: https://developers.cloudflare.com/data-localization/

## 3. Selected deployment shape

### Static site

- Keep the existing GitHub Pages/static deployment for the archive.
- Keep all M49 submission features disabled until launch approval.
- Add no provider keys, service-role keys, moderator credentials or deletion secrets to the public repository.
- Do not create a production Supabase project until the operator has accepted the DPA, checked the current subprocessors, selected the exact eu-central-1 region and confirmed billing ownership.

### Supabase project

Project region: **eu-central-1 — Frankfurt**. Do not select the generic Europe grouping where the provider can allocate a region based on capacity. The exact region is chosen at project creation; Supabase says a project's region cannot be changed in place, so region changes require migration to a new project.

Plan: **Pro**, as the proposed production baseline. Do not use Free for public production: it lacks automatic database backups and free projects can pause after one week of inactivity. Pro's current 7-day daily backup window is comfortably inside the proposed 30-day backup-expiry ceiling, but restore controls remain mandatory.

Functions:
- Invoke submission, withdrawal, published-feed and moderation functions in eu-central-1.
- Verify the function response's x-sb-edge-region during release acceptance.
- Do not use globally invoked functions for M49 data processing.
- Do not enable Storage in v1, avoiding media upload and global CDN caching paths.

### Database / API boundary

Use four logical data domains:

1. contributions — private body, optional archive ID, status, created/published/expiry timestamps and opaque public ID.
2. moderators — Supabase Auth user UUID, role, active flag and role-change metadata. No public profile fields.
3. moderation_events — opaque contribution ID, moderator UUID, fixed action/reason code and timestamp. Do not copy submitted text into audit notes.
4. withdrawal_keys and deletion_tombstones — key verifier and opaque deletion/expiry markers, separated from public content.

A short-lived rate-limit store may be implemented separately from contribution content. Do not put raw request bodies, withdrawal keys, raw IP addresses or full user-agent strings into application logs.

Direct anonymous table access is denied. The public browser uses the Supabase publishable key only to invoke narrowly scoped Edge Functions; no direct INSERT, UPDATE or unrestricted SELECT policy is granted to anon. Public reads return only a fixed, escaped projection of PUBLISHED rows. Pending, rejected, quarantined, withdrawn, expired and removed rows are never returned.

The server-side functions may use a secret database credential from Supabase's server-side secrets. It must never be embedded in JavaScript, HTML, GitHub Actions logs or source control. Because a service-role credential bypasses RLS, each privileged function must make its own explicit authentication, MFA and role check before performing moderation work. The public submission and withdrawal handlers must expose only their narrow individual operations.

### Function contract

- published-feed: GET only; fixed page size; published records only; no private columns; escaped plain text.
- submit: POST only; 500-character maximum; strict allowlist of fields; archive ID allowlist; consent flags; request-size limit; server-side rate limit; creates PENDING; returns a high-entropy withdrawal key once.
- withdraw: POST only; verifies the one-time key; changes state to WITHDRAWN; removes it from the public feed immediately; creates a deletion tombstone.
- report: POST only; fixed report reason codes; no reporter identity field; inserts into a private report queue.
- moderation-queue: authenticated moderator read; requires a valid moderator role and MFA aal2.
- moderation-action: authenticated moderator action; only allowed state transitions; records a fixed reason code and moderator ID; rejects self-approved or invalid transitions according to the two-person review rules.
- retention-sweep: server-side scheduled function; expires submissions, withdrawal verifiers, rate-limit buckets and stale queue items in accordance with the published retention schedule.

No client-side flag, route hiding or unguessable URL is an authorization boundary. Every privileged API operation must independently validate identity, MFA and role on the server.

## 4. Moderator identity and access model

Public contributors remain anonymous and do not sign in.

Moderators use invite-only Supabase Auth accounts. Public account creation is disabled. Every moderator must enrol a TOTP authenticator and privileged endpoints must require the Supabase MFA assurance level aal2. Moderator authorization is held in a separate database role table, not in user-editable metadata.

Roles:

| Role | Privileges | Assignment status |
| --- | --- | --- |
| Service owner | Billing, provider settings, secrets, backups, incident response, access grants and deployment approval | **Not yet named** |
| Moderation lead | Queue triage, ordinary approve/reject, temporary unpublish, retention review and report coordination | **Not yet named** |
| Backup moderator | Covers the lead, provides second-person review for sensitive/ambiguous cases, can unpublish on credible immediate risk | **Not yet named** |
| Privacy request contact | Receives privacy/withdrawal escalation and coordinates closure with the service owner | **Real contact route not yet supplied** |

The same person may hold the service-owner and moderation-lead roles only if that arrangement is explicitly accepted and an independent backup moderator is still appointed. No person is presumed to have accepted a role. The exchange must remain closed until a primary and backup reviewer, a service owner and a monitored privacy contact are explicitly nominated.

The moderation console may be a static page, but it is not trusted. The page may be public code; the queue data and all privileged actions are protected by server-side Supabase Auth, MFA, role verification and database policy.

## 5. Moderation operating procedure

### Review cadence and intake controls

- Publish the exact service hours and the real privacy/safety contact before opening submissions.
- Target routine first review within **3 working days**. This is an operating target, not a 24/7 promise.
- Review the queue at least twice each week while submissions are enabled.
- Pause new submissions if the assigned lead or backup is unavailable, if the oldest pending item exceeds 7 days, if the queue reaches 25 pending items, or if abuse controls are degraded.
- Keep existing published records readable while intake is paused, unless an incident requires the whole exchange to be disabled.
- Pending submissions older than 30 days are deleted without publication.

### Decision rules

- One moderator may approve clearly low-risk, policy-compliant text.
- A second moderator is mandatory for ambiguous personal-data cases, third-party references, contested rights, threats, allegations, or any safety decision that could materially affect a person.
- Quarantine/unpublish first where credible doxxing, threats, non-consensual material or immediate risk is present; review the evidence privately afterwards.
- No silent rewriting of contributor meaning. Reject fragments requiring significant edits.
- Automated filters are advisory triage only and never approve or publish.
- Use fixed reason codes. Do not create a free-text dossier about contributors.

### Weekly / monthly duties

- Twice weekly: review pending queue and reports, act on obvious abuse, and verify intake is operating within capacity.
- Weekly: check expiries, withdrawal requests, stale pending submissions and that no private rows appear in the public response.
- Monthly: sample access logs and moderator audit records, review moderator membership, check provider settings and confirm the privacy contact still works.
- After any restore: keep public reads and intake disabled; restore to an isolated target, apply the current deletion/expiry tombstone manifest, validate public output and require a second moderator sign-off before reopening.

## 6. Retention and backup fit

| Item | M49 target | Supabase Pro consideration |
| --- | --- | --- |
| Pending / rejected body | 30 days maximum | Must be deleted by scheduled retention sweep. |
| Published fragment | 180 days then expire unless re-reviewed and renewed | Store explicit expires_at; remove from public projection on expiry even if a cleanup job is delayed. |
| Withdrawal verifier | Delete within 30 days after withdrawal/removal/expiry | Remove in the retention sweep. |
| Rate-limit buckets | 24 hours | Use short-lived, segregated data; never repurpose as visitor identity. |
| Rotating keyed anti-abuse value | 7 days maximum | Use short-lived HMAC rotation; do not store raw address. |
| Moderator action metadata | 12 months | Opaque contribution ID, moderator ID, fixed reason code and timestamp only. |
| Database backups | No deleted contribution copy older than 30 days | Pro currently offers 7 days of daily backups. |

A database restore can reintroduce a withdrawn/expired item if the restored backup predates the withdrawal. Therefore, do not reopen the public feed immediately after restoring a backup. Keep a deletion/expiry tombstone manifest outside the database backup set, retain only opaque IDs and action dates, apply it to the restored database in an isolated environment, verify the published projection and require a second-person check. The manifest must not contain contribution bodies, withdrawal keys or reporter details.

Supabase platform logs currently have a 7-day retention window on Pro. Application logging must remain deliberately minimal and must never include bodies, raw request headers, withdrawal keys or sensitive content. Keep the moderation decision trail in the private database table, not in general function logs.

## 7. Privacy and vendor review

Supabase's selected project region is a primary data-location choice, not a promise that every operational data flow stays there. Before provisioning:

1. Review and accept the current Supabase DPA.
2. Review the current subprocessor register and data-transfer terms.
3. Confirm where project-account/billing details and support access are processed.
4. Confirm the EU-based log storage and any processing outside the selected project region.
5. Confirm the exact retention and deletion behaviour of database backups, Auth data, logs and support exports.
6. Confirm account ownership and billing access are held by the nominated service owner.
7. Document the lawful basis, privacy notice, contributor consent, withdrawal and cross-border transfer terms with qualified privacy/legal review for the actual operator and jurisdictions involved.

If the required privacy assessment does not accept Supabase's out-of-region operational processing, stop. Reassess Cloudflare D1 with EU jurisdiction and the cost/entitlement of the Enterprise Data Localization Suite, or choose a self-hosted EU-only deployment with a named operator. Do not describe either option as GDPR-compliant merely because a database is placed in the EU.

## 8. Activation checklist

The following items remain launch blockers:

- [x] Preferred backend chosen: Supabase Pro.
- [x] Project region selected in the design: eu-central-1 (Frankfurt).
- [x] Initial provider architecture and access boundaries documented.
- [x] Moderation roles, review cadence, queue limits and fail-closed procedure defined.
- [ ] Service owner explicitly nominated.
- [ ] Lead moderator and independent backup moderator explicitly nominated.
- [ ] Monitored privacy/safety contact supplied.
- [ ] Supabase account, DPA, subprocessors and transfers reviewed by the service owner and qualified privacy/legal adviser.
- [ ] Production Supabase project provisioned in the exact selected region and billing owner confirmed.
- [ ] Moderator accounts invited; TOTP MFA enforced; privileged routes verify aal2 and the server-side role.
- [ ] RLS, Edge Function boundaries, logging settings and rate limits configured and threat-tested.
- [ ] Withdrawal, expiry, tombstone and backup-restore drill demonstrated.
- [ ] Public consent, privacy notice and service-hours copy approved.
- [ ] Two-person moderation drill and incident-response exercise completed.

**Until every unchecked item is completed, M49 remains closed to public contributions.** Documentation and a target backend choice do not activate the service.

## 9. Decision review

Revisit the provider choice if Supabase changes its regional processing terms, backup/log retention, MFA/RLS capabilities or pricing materially; if the project requires absolute EU-only processing; or if an appointed operator prefers and can maintain a Cloudflare or self-hosted alternative.

This decision does not authorise uploading contributor data, creating the production project, entering billing details, or publishing a form. Those steps require the service owner and moderator/privacy roles to be named first.
