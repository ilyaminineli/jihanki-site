# M49 — Visitor Memory Exchange
## Privacy, consent, moderation and abuse-prevention design

**Status:** Design baseline drafted; implementation blocked  
**Scope:** This document is a product and operational design, not a privacy notice, legal opinion or deployed moderation service.  
**Current behaviour:** JIHANKI remains a static archive. No contribution form, upload endpoint, moderation API or remote visitor profile is created by this milestone.

## 1. Decision and release boundary

M49 may only proceed after the project has selected a backend and hosting region, named the people responsible for moderation and privacy requests, approved the public rules and consent copy, and demonstrated the complete removal and retention process.

The static archive must remain fully usable when an exchange service is unavailable, disabled or intentionally not configured. A failed submission must never be silently stored in the visitor's museum, event log or browser storage as a substitute.

**No M49 submission UI or public endpoint should be merged before every release gate in section 12 is signed off.**

## 2. Product principles

1. **Anonymous by default.** The public archive displays no contributor account, profile, handle, avatar, social link or location.
2. **Human approval before publication.** Every contribution is private and pending until a moderator explicitly approves it. No automated classifier may publish content.
3. **Collect as little as possible.** No account, email address, phone number, date of birth, public IP address, precise location or contact list is needed for the intended experience.
4. **Text-first, no arbitrary uploads.** The first release accepts a short text fragment and an optional association with an existing JIHANKI record. This is enough to create an exchange without opening an unrestricted media pipeline.
5. **Withdrawal is real.** A contributor receives a one-time deletion key. The server stores only a verifier for that key and can use it to withdraw a pending or published contribution.
6. **No social network mechanics.** No comments, replies, direct messages, follower graph, public likes, ranking, popularity counters or user-to-user contact.
7. **The archive is not a crisis or reporting service.** Clear rules explain the limited moderation capacity and provide no promise of emergency response.

## 3. First-release contribution contract

### Allowed

- One plain-text memory fragment, maximum 500 characters.
- A short response to an editorial machine prompt, under the same text limit.
- An optional association to one existing public archive record, selected from a server-side allowlist of stable archive IDs.
- Optional broad thematic labels selected from a fixed list maintained by the archive editor.

The association points to an existing record; it does not let the contributor add an external URL, image, audio file or new location pin.

### Deferred

- **Photographs:** no image uploads in the first release. Images can disclose faces, bystanders, homes, screens, documents, EXIF/GPS metadata and copyright material. Any later image milestone needs a separate consent, metadata-stripping, rights and human-review design.
- **Audio and voice recordings:** no audio uploads or in-browser recording. A visitor may select an existing public sound record as an association, but may not attach a voice file.
- **Video, arbitrary files, external links, comments and private messages:** out of scope.
- **Public names, handles, avatars and precise places:** not accepted as contribution fields.

The submission UI must clearly warn visitors not to include their own or another person's name, contact details, account handles, exact address, routine, workplace/school, identifying document, or sensitive personal information.

## 4. Consent and contributor expectations

Before submission, the visitor must actively confirm all of the following. Consent controls are separate from the submit button and are not preselected:

- They are at least 18 years old. The first release should not request a birth date or identity document. This self-attestation is not proof of age; legal review must decide whether it is sufficient in the selected jurisdictions.
- The text is their own, or they have the rights and permission needed to submit it.
- They understand that approval makes the text publicly readable by anyone.
- They understand that publication is anonymous and JIHANKI will not provide private replies or a contributor account.
- They have read the prohibited-content rules and understand that a moderator may reject or remove a fragment.
- They understand the retention and withdrawal limits, including the time needed for backup expiry.

The publishing permission should be a narrow, non-exclusive, worldwide, royalty-free permission to host, reproduce and display the submitted text within JIHANKI, and to make technical formatting changes needed for that purpose. It must not grant unrelated commercial reuse, merchandising, sublicensing for unrelated purposes or AI-model training. Hosting and security vendors may process data only as service providers for JIHANKI.

The contributor must see the complete consent copy before agreeing. Legal review must approve the final wording, governing law, withdrawal explanation and vendor language before deployment.

## 5. Data flow and separation

1. The browser sends the text only after an explicit submit action and all consent checks.
2. The service validates size, encoding, allowed fields, archive ID and rate limits on the server. Client-side validation is only a convenience.
3. The submission enters a private moderation queue with status PENDING. It is not included in any public catalogue, search index, sitemap, cache or static export.
4. A moderator reviews the content and chooses APPROVE, REJECT or QUARANTINE. Automated filters may label suspected spam, personal data or policy issues for human attention; they cannot make the final publish decision.
5. Approval creates a public record with a random opaque ID and only the text, allowed category, optional archive reference and publication date. It contains no contributor key, source address, user-agent, email or account.
6. The public read endpoint returns APPROVED/PUBLISHED records only. Pending, rejected and quarantined content is never accessible from the public endpoint.
7. The contribution is stored separately from M47's browser-local museum, purchase receipts and machine event history. It is not imported into the visitor's local collection automatically.

The public site should request exchange data only when the visitor explicitly opens the exchange view. The rest of JIHANKI must not depend on this request.

## 6. Moderation states and decisions

| State | Meaning | Publicly visible |
| --- | --- | --- |
| PENDING | Received and awaiting human review | No |
| QUARANTINED | Temporarily held for safety or second review | No |
| APPROVED | Human-approved, awaiting publication job | No |
| PUBLISHED | Approved and available in the exchange | Yes |
| REJECTED | Not accepted | No |
| WITHDRAWN | Removed at contributor request | No |
| EXPIRED | Removed at the end of its publication period | No |
| REMOVED | Removed by a moderator after publication | No |

Permitted transitions are PENDING to APPROVED, REJECTED or QUARANTINED; QUARANTINED to APPROVED or REJECTED; APPROVED to PUBLISHED; and PUBLISHED to WITHDRAWN, EXPIRED or REMOVED. No automatic transition may publish a record.

### Review protocol

- A trained human moderator reads every contribution before publication.
- The reviewer checks policy, personal data, third-party identification, consent, copyright, coercion, threats and whether the fragment is suitable for a public archive.
- Ordinary low-risk text may be approved by one moderator. Ambiguous, high-risk or sensitive cases require a second reviewer.
- Moderators must not silently rewrite a contributor's meaning. A fragment needing substantial editing is rejected with a generic reason and may be resubmitted in a safer form.
- Automated detection is assistive triage only. A score or classifier result is never proof that a contribution is safe or abusive.
- If there is credible risk of doxxing, threats, non-consensual material or immediate harm, moderators quarantine or unpublish first and investigate privately.
- Reviewer actions use fixed reason codes. Free-form internal notes must not repeat unnecessary personal data.

### Prohibited content

Reject or remove content that contains or solicits:

- Names, handles, contact details, precise location, routines or other information that identifies the contributor or another private person.
- Doxxing, stalking, threats, targeted harassment, intimidation, hate or dehumanisation.
- Sexual content involving minors, non-consensual intimate material or exploitative imagery.
- Instructions, offers or recruitment for violence, exploitation, self-harm or other serious harm.
- Medical, financial, legal, immigration or other sensitive personal records about an identifiable person.
- Copyrighted text or media without permission, impersonation, fabricated attribution, spam, advertising or malicious links.
- Content that identifies a child, school, home, workplace or a person's predictable movements.

Moderators should prefer rejection over attempting to determine whether a sensitive real-world story is true. The exchange is not a venue for investigating allegations about identifiable people.

## 7. Identity minimisation, security and anti-abuse controls

### Public and application data

- Do not ask for or display a name, email, account, phone, social handle, avatar, exact location, age/date of birth or identity document.
- Store no persistent public pseudonym or cross-submission visitor identifier.
- Do not place submission text in analytics, application logs, error traces, URLs, query strings, referrers or third-party telemetry.
- Render approved text as escaped plain text. Do not accept HTML, Markdown links, embedded media, SVG or script-capable content.
- Use a restrictive Content Security Policy, output encoding, same-origin requests where possible, CSRF protections, strict content-type checks, request-size limits and server-side schema validation.
- Keep the moderation console on a separately protected route with individual moderator accounts, MFA, least-privilege roles and a private audit trail. Never ship moderation credentials or privileged API keys to the browser.

### Abuse controls

- Apply server-side per-submission and per-network rate limits, queue caps and a global circuit breaker.
- For short-lived rate limiting, use a keyed, rotating HMAC of the source address in volatile or short-retention storage rather than a reusable raw IP record. Do not expose that value to moderators or the public.
- Configure the hosting edge and application logger to avoid retaining raw IP addresses, request bodies, full user-agent strings and query parameters. Verify provider-level logs, not only application code.
- Add a challenge only if real abuse justifies it; assess the challenge provider's cookies, tracking, accessibility and data transfers before enabling it.
- Keep public report controls rate-limited and private. Report volume must not automatically remove a record or expose a report count; a moderator assesses reports.
- A service outage, queue overflow or moderation backlog closes new submissions safely. Existing archive navigation continues normally.

### Threats considered

Spam and queue flooding; cross-site scripting; malicious payloads; doxxing; impersonation; copyright violations; non-consensual content; coordinated false reporting; moderator account compromise; disclosure through provider logs or backups; and withdrawal-key theft.

## 8. Withdrawal, deletion and retention

A successful submission returns a random high-entropy withdrawal key once. The visitor is told to keep it; JIHANKI does not email it, put it in the URL or save it automatically in M47. The server stores only a cryptographic verifier, separated from the public record. Anyone possessing the key can request withdrawal, so the UI must warn visitors not to share it.

A visitor can use the key to withdraw a pending or published contribution without creating an account. A moderator can also remove content for policy or safety reasons. Withdrawal removes the public text immediately from the live response and queues, while backup copies expire on the stated backup schedule. The confirmation must not promise that copies already downloaded or independently cached by third parties can be recalled.

Recommended initial retention limits, to be rechecked against the selected provider and legal advice:

| Data | Maximum retention |
| --- | --- |
| Pending submission | 30 days, then delete if not reviewed |
| Rejected submission body | 30 days after decision, then delete |
| Published contribution | 180 days, then expire unless a moderator explicitly renews it after review |
| Withdrawal-key verifier | Until the contribution is withdrawn, removed or expired, then delete within 30 days |
| Abuse/rate-limit buckets | 24 hours |
| Rotating keyed anti-abuse value | No more than 7 days; never kept as a stable identifier |
| Moderator decision metadata | 12 months, using opaque record ID and fixed reason codes, not the submitted body |
| Backups containing deleted records | Purge within 30 days; deletion status must prevent restoration into public output |

These are design targets, not claims about a provider's current defaults. If a provider cannot meet them, select another provider or disclose and approve a different schedule before launch.

## 9. Reporting, appeals and incident response

- Every published fragment has a discreet REPORT action with fixed categories: personal information, harassment/threat, non-consensual content, copyright, spam/malware, other safety concern.
- A report does not ask for the reporter's identity or free-form personal details. A short optional explanation must warn against submitting sensitive information.
- Reports enter a separate private triage queue and do not expose the reporter or report count to the contributor.
- The moderation lead reviews high-risk reports promptly during the published service hours. JIHANKI must state that it is not monitored continuously and is not an emergency service.
- A moderator may temporarily unpublish a reported item when credible immediate risk exists; otherwise a report is assessed before action.
- Contributors whose fragment is rejected may submit a different, policy-compliant fragment. Do not create a public appeal discussion or private messaging channel in v1.
- Maintain a documented response plan for exposed personal data, moderator compromise, malicious content and provider incidents: contain, unpublish, preserve only the minimum incident evidence, notify affected people where appropriate, and record closure.

Before launch, the operator must publish a real contact route for privacy and safety requests. That route must be monitored and must not be fabricated or silently pointed at a personal social account.

## 10. Backend and deployment requirements

The backend is not chosen by this document. Evaluate candidate providers against:

- Hosting and database region; data-transfer and subprocessor terms.
- Configurable access-log retention and ability to avoid raw IP/body logging.
- Encryption in transit and at rest, backups and deletion guarantees.
- Moderator authentication with MFA, role separation and auditable decisions.
- Private queue access and an API that never exposes pending content.
- Rate limiting, queue caps, export and deletion tooling, incident response and service availability.
- Cost and a realistic maintenance owner.

Keep public reading, submission, moderation and deletion privileges separated. The browser may hold only the public read interface and submit capability; it must never receive administrative credentials. If the chosen service cannot support these boundaries, do not launch M49.

## 11. Visitor-facing transparency

Before the submit button, show: what is collected; what is not collected; that a human reviews every fragment; that approved text is public; that submissions are not private messages; the 180-day publication limit; how withdrawal works; that backups may take up to 30 days to purge; and the operator's real privacy contact.

After submission, show a local receipt and one-time withdrawal key with an explicit copy/save action initiated by the visitor. Do not put the key in a shareable URL or analytics event.

The public exchange should display an editorial note that fragments are visitor contributions, moderated before publication, and not necessarily verified factual accounts. It should display no contributor identifiers.

## 12. M49 release gates

All boxes below must be completed before implementation is enabled:

- [ ] Select a backend and data region after reviewing provider logs, subprocessors, retention and backup behaviour.
- [ ] Name a moderation lead and backup reviewer; confirm their capacity and review schedule.
- [ ] Publish the content policy, operator contact and incident-response procedure.
- [ ] Obtain legal/privacy review of consent, adult-only self-attestation, publication licence, withdrawal and cross-border processing for the actual operator and service jurisdictions.
- [ ] Verify server-side text validation, output escaping, CSP, CSRF, rate limits, queue caps and fail-closed behaviour.
- [ ] Demonstrate that pending/rejected records never reach public reads, search, CDN caches or static exports.
- [ ] Demonstrate withdrawal from live output and deletion from backups within the disclosed schedule.
- [ ] Test moderator MFA, role separation, audit trail, compromise response and report handling.
- [ ] Run abuse cases for spam floods, personal-data submission, malicious markup, non-consensual content and coordinated reporting.
- [ ] Approve the visitor-facing consent, privacy and withdrawal copy.

Until then, M49 remains a written design only. No contribution API, client form, anonymous upload or hidden collection endpoint should be added.

## 13. Open decisions

The project still needs to decide the backend vendor and region, the named operator, the real privacy contact, the moderation hours, whether 18+ self-attestation meets applicable requirements, and whether the proposed retention schedule is technically and legally supportable. These decisions cannot be inferred from the current static repository.
