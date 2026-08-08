import sgMail from '@sendgrid/mail'

const SENDGRID_KEY = process.env.SENDGRID_API_KEY
const FROM = process.env.MAIL_FROM || 'no-reply@teachers-arena.example'

if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY)

export async function sendApprovalEmail(to: string, materialTitle: string, approved: boolean) {
  if (!SENDGRID_KEY) return console.warn('SendGrid not configured — skipping approval email')
  const subject = approved ? 'Your material was approved' : 'Your material was rejected'
  const text = approved ? `Congratulations! Your material "${materialTitle}" was approved and your account is now eligible for the teacher discount.` : `We're sorry. Your material "${materialTitle}" was rejected.`
  const msg = {
    to,
    from: FROM,
    subject,
    text
  }
  try { await sgMail.send(msg) } catch (err) { console.error('SendGrid error', err) }
}

export async function sendPurchaseEmail(to: string, materialTitle: string, downloadUrl: string) {
  if (!SENDGRID_KEY) return console.warn('SendGrid not configured — skipping purchase email')
  const subject = `Your purchase: ${materialTitle}`
  const text = `Thanks for your purchase. Download your material here: ${downloadUrl} (link expires in 1 hour)`
  const msg = { to, from: FROM, subject, text }
  try { await sgMail.send(msg) } catch (err) { console.error('SendGrid error', err) }
}
