import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServiceSupabaseClient } from './_lib/supabase';
import { isRecord, sendMethodNotAllowed, sendServerError } from './_lib/http';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^[+]?[\d\s().-]{7,24}$/;

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }
  if (!isRecord(req.body)) {
    res.status(400).json({ error: 'A JSON request body is required.' });
    return;
  }

  const kind = req.body['kind'];
  const fullName = text(req.body['fullName'], 160);
  const email = text(req.body['email'], 320);
  const service = text(req.body['service'], 120);
  if (!fullName || !email || !emailPattern.test(email) || !service) {
    res.status(400).json({ error: 'Enter a name, valid email address, and service.' });
    return;
  }

  try {
    const supabase = createServiceSupabaseClient();
    if (kind === 'contact') {
      const subject = text(req.body['subject'], 200);
      const message = text(req.body['message'], 10000);
      const rawPhone = req.body['phone'];
      const phone = rawPhone === '' || rawPhone === undefined ? '' : text(rawPhone, 24);
      const company = req.body['company'] === '' || req.body['company'] === undefined
        ? ''
        : text(req.body['company'], 200);
      if (!subject || !message || phone === null || company === null || (phone && !phonePattern.test(phone))) {
        res.status(400).json({ error: 'Complete the required enquiry fields with valid values.' });
        return;
      }
      const { error } = await supabase.from('contact_messages').insert({
        full_name: fullName,
        email,
        phone,
        company,
        service,
        subject,
        message
      });
      if (error) throw error;
    } else if (kind === 'consultation') {
      const preferredDate = text(req.body['preferredDate'], 10);
      const notes = req.body['notes'] === '' || req.body['notes'] === undefined
        ? ''
        : text(req.body['notes'], 5000);
      if (!preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || notes === null) {
        res.status(400).json({ error: 'Choose a valid preferred date and provide valid notes.' });
        return;
      }
      const { error } = await supabase.from('consultation_requests').insert({
        full_name: fullName,
        email,
        service,
        preferred_date: preferredDate,
        notes
      });
      if (error) throw error;
    } else {
      res.status(400).json({ error: 'Choose a supported enquiry type.' });
      return;
    }

    res.status(201).json({ message: 'Your request has been submitted.' });
  } catch (error) {
    sendServerError(res, error, 'Your request could not be saved. Please try again later.');
  }
}
