# STUDIO roadmap (from uploaded spec)

- [ ] October 30 source transfer: GitHub API linked; Workflow verified public with README only, latest commit cdab897. Blocked on source visibility/snapshot decision; existing repositories cannot be attached to automatic Lovable Git sync.
- [x] October 30 backend/email checks: existing Cloud schema and RLS inspected; synthetic application saved with private ID; confirmation reached connected Gmail; exact admin recipient retained and Resend 403 verified. Gmail linked and application credential check returned HTTP 200.

- [ ] Complete secure-backend audit and hardening from October 28 specification; preserve existing design and exact notification recipient.
- [ ] Repair submission finalization, persist privacy consent, validate all attachments, verify duplicate protection and failure recovery.
- [ ] Secure administrator access, audited review controls, college-ID deletion and email retry.
- [ ] Audit repository hygiene, dependencies, hosting configuration and document verified launch checks; external access and verified Resend sender required.

- [ ] Landing revision: compact APCOER context, commitment, maker attribution, supplied image; preserve application workflow.

- [x] 1. Design system, landing page, FAQ, footer, privacy page
- [x] 2. Multi-step application form, validation, review screen, browser drafts (no files in drafts)
- [x] Recruitment-closed page (static config flag for now)
- [x] 3. Lovable Cloud: schema (applications, files, status history, notes, email events, settings), RLS, private storage
- [x] 4. Secure server-side submission + attachment upload (verified end-to-end: record + file saved, idempotent on retry)
- [~] 4b. Emails: admin notification + applicant confirmation sent once after save, every attempt logged, hourly automatic retry (no duplicates). Blocked: Resend needs a verified domain + RESEND_FROM_EMAIL before omkarkavale888@gmail.com can receive.
- [ ] 5. College-email verification for application replacement
- [ ] 6. Admin dashboard (show previous work as optional supporting evidence only, no auto-ranking; auth, roles, filters, status workflow, notes, signed URLs, open/close recruitment)
- [ ] 7–8. Resend emails + delivery logging/retry (blocked: needs Resend API key + verified sender domain)
- [ ] 10. End-to-end testing
