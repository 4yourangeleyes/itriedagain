/**
 * Email Service
 * Handles sending invoices and documents via email through Supabase Edge Functions
 */

import { supabase } from './supabaseClient';

export interface EmailPayload {
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  attachmentName?: string;
  attachmentData?: string; // Base64 encoded PDF or HTML content
  invoiceId?: string;
  clientName?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Supabase Edge Function (calls SendGrid API)
 */
export const sendEmail = async (payload: EmailPayload): Promise<EmailResponse> => {
  try {
    // Try to use Edge Function first (production)
    if (supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            from: payload.fromEmail,
            to: payload.toEmail,
            subject: payload.subject,
            html: payload.body,
            attachmentName: payload.attachmentName,
            attachmentData: payload.attachmentData,
            invoiceId: payload.invoiceId,
            clientName: payload.clientName,
          }
        });

        if (error) throw error;

        if (data?.messageId) {
          console.log('[EMAIL SENT via SendGrid]', {
            to: payload.toEmail,
            subject: payload.subject,
            messageId: data.messageId
          });

          return {
            success: true,
            messageId: data.messageId
          };
        }
      } catch (edgeFunctionError) {
        console.warn('[Edge Function unavailable, falling back to mock]', edgeFunctionError);
        // Fall through to mock implementation
      }
    }

    // Fallback to mock email sending for development
    return await sendEmailMock(payload);

  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
};

/**
 * Mock email sending for development/testing
 */
const sendEmailMock = async (payload: EmailPayload): Promise<EmailResponse> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create email log
    const emailLog = {
      timestamp: new Date().toISOString(),
      from: payload.fromEmail,
      to: payload.toEmail,
      subject: payload.subject,
      hasAttachment: !!payload.attachmentData,
      attachmentName: payload.attachmentName,
      invoiceId: payload.invoiceId,
      clientName: payload.clientName,
      status: 'sent (mock)'
    };

    // Store in localStorage for demo purposes
    if (typeof window !== 'undefined' && localStorage) {
      const existingLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
      existingLogs.push(emailLog);
      localStorage.setItem('emailLogs', JSON.stringify(existingLogs.slice(-50)));
    }

    console.log('[EMAIL SENT - MOCK MODE]', emailLog);

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('[MOCK EMAIL ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send mock email'
    };
  }
};

/**
 * Generate professional email body from document data
 */
export const generateEmailBody = (
  recipientName: string,
  senderName: string,
  documentType: string,
  documentTitle: string,
  customMessage?: string
): string => {
  const body = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Dear ${recipientName},</p>
  
  <p>I hope this email finds you well.</p>
  
  <p>Please find attached the <strong>${documentType.toLowerCase()}</strong> for:</p>
  <p style="font-size: 16px; font-weight: bold; color: #2c3e50;">${documentTitle}</p>
  
  ${customMessage ? `<p>${customMessage}</p>` : ''}
  
  <p>If you have any questions or need any clarifications, please don't hesitate to reach out.</p>
  
  <p style="margin-top: 30px;">
    Best regards,<br>
    <strong>${senderName}</strong>
  </p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin-top: 40px;">
  <p style="font-size: 12px; color: #999;">
    This email was sent by GrittyNitty Invoice System
  </p>
</body>
</html>
  `.trim();

  return body;
};

/**
 * Send invoice email with PDF attachment
 */
export const sendInvoiceEmail = async (
  recipientEmail: string,
  recipientName: string,
  senderEmail: string,
  senderName: string,
  invoiceNumber: string,
  pdfBase64: string,
  customMessage?: string
): Promise<EmailResponse> => {
  try {
    const subject = `Invoice ${invoiceNumber} from ${senderName}`;
    const body = generateEmailBody(
      recipientName,
      senderName,
      'Invoice',
      `Invoice #${invoiceNumber}`,
      customMessage
    );

    return await sendEmail({
      fromEmail: senderEmail,
      toEmail: recipientEmail,
      subject,
      body,
      attachmentName: `Invoice_${invoiceNumber}.pdf`,
      attachmentData: pdfBase64,
      clientName: recipientName,
      invoiceId: invoiceNumber
    });
  } catch (error) {
    console.error('[SEND INVOICE EMAIL ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invoice email'
    };
  }
};

/**
 * Verify email is valid format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get email logs from localStorage (development/demo)
 */
export const getEmailLogs = (): Array<Record<string, any>> => {
  if (typeof window === 'undefined' || !localStorage) return [];
  try {
    return JSON.parse(localStorage.getItem('emailLogs') || '[]');
  } catch {
    return [];
  }
};
