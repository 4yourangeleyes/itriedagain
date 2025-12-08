// Supabase Edge Function: send-email
// Deploy with: supabase functions deploy send-email
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface EmailRequest {
  to: string
  from: string
  subject: string
  html: string
  attachmentName?: string
  attachmentData?: string // Base64
  invoiceId?: string
  clientName?: string
}

serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { to, from, subject, html, attachmentName, attachmentData, ping } = await req.json() as EmailRequest & { ping?: boolean }

    // 0. Health Check (Ping)
    if (ping) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Email service is online' }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // 1. Check for API Keys (Support SendGrid or Resend)
    // @ts-ignore
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    // @ts-ignore
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!SENDGRID_API_KEY && !RESEND_API_KEY) {
      throw new Error('No Email API Key configured (SENDGRID_API_KEY or RESEND_API_KEY)')
    }

    let result;

    // 2. Send via SendGrid
    if (SENDGRID_API_KEY) {
      const payload: any = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject: subject,
        content: [{ type: 'text/html', value: html }],
      }

      if (attachmentName && attachmentData) {
        payload.attachments = [{
          content: attachmentData,
          filename: attachmentName,
          type: 'application/pdf',
          disposition: 'attachment'
        }]
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`SendGrid Error: ${errorText}`)
      }
      
      result = { provider: 'SendGrid', status: 'sent' }
    } 
    // 3. Send via Resend (Alternative)
    else if (RESEND_API_KEY) {
      const payload: any = {
        from: from,
        to: to,
        subject: subject,
        html: html,
      }

      if (attachmentName && attachmentData) {
        payload.attachments = [{
          filename: attachmentName,
          content: attachmentData, // Resend expects buffer or base64? Need to check docs. Usually buffer.
          // For simplicity in this generic function, we'll assume the user handles the specific provider format
          // or we'd need a more complex implementation.
          // Resend API is simpler:
        }]
      }
      
      // Simplified Resend fetch for brevity
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Resend Error: ${errorText}`)
      }

      result = { provider: 'Resend', status: 'sent' }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )

  } catch (error) {
    console.error('Email Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
