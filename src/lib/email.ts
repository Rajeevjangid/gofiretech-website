import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendStudentCredentials(opts: {
  to: string
  name: string
  enrollmentId: string
  password: string
  loginUrl: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const fromName = 'GoFire Tech'
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gofiretech.com'
    await transporter.sendMail({
      from: `"${fromName}" <${from}>`,
      replyTo: from,
      to: opts.to,
      text: [
        `Welcome, ${opts.name}!`,
        '',
        'Your student account has been created. Here are your login credentials:',
        '',
        `Enrollment ID: ${opts.enrollmentId}`,
        `Email: ${opts.to}`,
        `Temporary Password: ${opts.password}`,
        '',
        'Please change your password after your first login.',
        '',
        `Login to Portal: ${opts.loginUrl}`,
        '',
        'GoFire Tech — Ignite Your Tech Career',
        'If you did not expect this email, please contact us.',
      ].join('\n'),
      subject: `Your GoFire Tech Student Portal Access — ${opts.enrollmentId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#0D1520;padding:32px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">GoFire Tech</h1>
            <p style="color:#E8001C;margin:8px 0 0;font-size:14px;">Student Learning Portal</p>
          </div>
          <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee;">
            <h2 style="color:#1a1a2e;margin-top:0;">Welcome, ${opts.name}!</h2>
            <p style="color:#555;">Your student account has been created. Here are your login credentials:</p>
            <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #E8001C;">
              <p style="margin:0 0 8px;"><strong>Enrollment ID:</strong> <code style="color:#E8001C;">${opts.enrollmentId}</code></p>
              <p style="margin:0 0 8px;"><strong>Email:</strong> ${opts.to}</p>
              <p style="margin:0;"><strong>Temporary Password:</strong> <code style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #ddd;">${opts.password}</code></p>
            </div>
            <p style="color:#555;">Please change your password after your first login.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${opts.loginUrl}" style="background:#E8001C;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Login to Portal</a>
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <p style="color:#999;font-size:12px;text-align:center;">GoFire Tech &mdash; Ignite Your Tech Career<br>If you did not expect this email, please contact us.</p>
          </div>
        </div>
      `,
    })
    return { success: true }
  } catch (err: any) {
    console.error('[email] sendStudentCredentials error:', err)
    return { success: false, error: err?.message || 'Email send failed' }
  }
}
