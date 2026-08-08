# TEACHERS-ARENA — Scaffold

This scaffold sets up a minimal Next.js + TypeScript starter with Prisma (Postgres), S3 helpers, and placeholder API routes for the upload → moderation → discount workflow.

What this commit includes:
- Next.js + TypeScript app skeleton
- Prisma schema with core models (User, Material, Purchase)
- Placeholder API endpoints for upload and admin approve
- S3 helper and Prisma client
- .env.example with required environment variables

Next steps I will take once you review/merge this branch:
- Implement signed S3 upload flow and virus-scan hook
- Implement admin moderation UI and API
- Implement Stripe checkout + webhook to create purchase records and presigned download links

If you want me to continue, say “Implement flow” and confirm any environment details (DB, S3, Stripe).