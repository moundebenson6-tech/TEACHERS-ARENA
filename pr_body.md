# PR: feat: secure upload/approval/checkout flow + UI

## Summary

This pull request adds a secure upload → moderation → purchase MVP with the following features:

- JWT auth (register/login) and role checks (teacher/admin)
- Presigned S3 upload & download URLs
- Material model with pending → scanned → approved workflow
- Virus scanning integration (VirusTotal; simulated when no key provided)
- Admin UI: pending list, scan trigger, approve/reject flow
- Stripe Checkout integration and webhook to create Purchase records
- Automatic teacher discount (default 10%) applied at checkout after approval
- SendGrid-based transactional emails (approval/rejection and purchase receipt)
- Vercel config (vercel.json) for deployment

## Branches

This PR was created from the following feature branches:
- scaffold/initial
- scaffold/feature/flow
- scaffold/feature/secure_and_ui
- scaffold/feature/full (this PR)

## Files / high-level changes

- Prisma schema additions (scan fields, downloadToken uniqueness)
- New libs: `src/lib/stripe.ts`, `src/lib/s3.ts`, `src/lib/virus.ts`, `src/lib/email.ts`, `src/lib/auth.ts`
- API routes: `upload`, `materials`, `checkout`, `webhooks/stripe`, `admin/list`, `admin/scan`, `admin/approve`, `download`
- Frontend pages: `register`, `login`, `upload`, `materials` list/detail, `admin` UI
- README updates and `vercel.json`

## Environment variables required

Fill these in before running or deploying:

- DATABASE_URL
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- SESSION_SECRET or JWT_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Optional (recommended for production behavior):
- VIRUSTOTAL_API_KEY (for real scanning)
- SENDGRID_API_KEY and MAIL_FROM (for transactional emails)

## Migration

Run locally or in CI before starting the app:

```
npx prisma migrate dev --name add_scanning_fields
```

## Checklist (recommended before merging / immediately after)

- [ ] Add an admin user (via Prisma Studio or direct DB change)
- [ ] Configure S3 bucket (private objects) and set env vars
- [ ] Configure Stripe keys and webhook URL (production webhook -> `/api/webhooks/stripe`)
- [ ] Configure SendGrid (optional) and VirusTotal (optional)
- [ ] Run `npx prisma migrate dev --name add_scanning_fields`
- [ ] Test end-to-end locally with Stripe CLI:
  - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Consider adding CI (tests), rate limiting, and monitoring before production

## Notes

- Admin approval requires a clean scan (`scanStatus === 'clean'`) to approve a material (unless using simulated scans).
- The current implementation simulates scans if `VIRUSTOTAL_API_KEY` is not supplied; it's strongly recommended to set up real scanning for production.
- All endpoints are protected with simple JWT-based auth; for production you may prefer NextAuth or another audited auth provider.
- This PR provides minimal UI to exercise the flows; UX polish and accessibility improvements are recommended.

---

If you'd like, I can:
- Add reviewers/labels to the PR
- Deploy this branch to a preview environment (Vercel) and help configure secrets
- Open follow-up issues for hardening (rate limiting, input validation, tests)
