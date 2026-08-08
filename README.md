# Additional setup notes

This branch implements the following additions:
- Virus scanning integration (VirusTotal) via POST /api/admin/scan
  - Requires VIRUSTOTAL_API_KEY in env to enable real scanning. If not provided, the system simulates a 'clean' scan.
- Transactional email via SendGrid. Configure SENDGRID_API_KEY and MAIL_FROM in env to enable email notifications.
- The admin approve flow now requires the material to have scanStatus === 'clean' before approving (to protect buyers).
- The Stripe webhook now sends a purchase receipt email with a presigned download link to the buyer.

To apply database changes, run:
  npx prisma migrate dev --name add_scanning_fields

Environment variables required (in addition to previous list):
- VIRUSTOTAL_API_KEY (optional)
- SENDGRID_API_KEY (optional)
- MAIL_FROM (optional)

