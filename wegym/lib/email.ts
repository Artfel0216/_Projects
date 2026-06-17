import { logger } from '@/lib/logger';

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, text, html } = payload;

  if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
    logger.info({ to, subject }, '[email] Dev mode — email not sent');
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WEGYM <noreply@wegym.app>',
        to,
        subject,
        text,
        html: html || text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      logger.error({ status: res.status, body: errBody }, '[email] Failed to send');
      return false;
    }

    logger.info({ to, subject }, '[email] Sent successfully');
    return true;
  } catch (err) {
    logger.error(err, '[email] Error sending email');
    return false;
  }
}

export function buildResetEmail(resetUrl: string): { text: string; html: string } {
  const text = `Redefina sua senha WEGYM acessando: ${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta alteração, ignore este email.`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#09090b;border-radius:16px;border:1px solid rgba(255,255,255,0.05);color:#e4e4e7;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:24px;font-weight:900;font-style:italic;color:#ea580c;">WEGYM</span>
      </div>
      <h1 style="font-size:18px;color:#fff;margin-bottom:12px;">Redefinição de senha</h1>
      <p style="font-size:14px;color:#a1a1aa;margin-bottom:24px;">
        Clique no botão abaixo para criar uma nova senha:
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
        Redefinir senha
      </a>
      <p style="font-size:12px;color:#71717a;margin-top:24px;">
        Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este email.
      </p>
    </div>
  `;
  return { text, html };
}
