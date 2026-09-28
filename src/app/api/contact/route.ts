import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import nodemailer from 'nodemailer'
import { z } from 'zod'


const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  course: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

async function sendNotificationEmail(data: {
  name: string
  email: string
  phone?: string
  course?: string
  message: string
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.CONTACT_EMAIL,
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF5A1F; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">New Contact Inquiry — GoFire Tech</h2>
        </div>
        <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td><td>${data.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${data.phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Course:</td><td>${data.course || 'Not specified'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td><td style="white-space: pre-wrap;">${data.message}</td></tr>
          </table>
        </div>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = contactSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, course, message } = validated.data

    const submission = await db.contactSubmission.create({
      data: { name, email, phone, course, message },
    })

    // Send email notification (non-blocking)
    sendNotificationEmail({ name, email, phone, course, message }).catch(console.error)

    return NextResponse.json(
      { success: true, message: 'Your message has been received! We will contact you within 24 hours.', id: submission.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [submissions, total] = await Promise.all([
      db.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.contactSubmission.count(),
    ])

    return NextResponse.json({ submissions, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

