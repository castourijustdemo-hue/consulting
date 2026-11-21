import { VercelRequest, VercelResponse } from '@vercel/node';
import { createPublicSupabaseClient, createServiceSupabaseClient } from './_lib/supabase.js';
import { isRecord, sendMethodNotAllowed, sendServerError } from './_lib/http.js';
import { requireAdmin } from './_lib/admin-auth.js';

async function isAdministrator(userId: string): Promise<boolean> {
  const serviceClient = createServiceSupabaseClient();
  const { data, error } = await serviceClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'GET') {
    const admin = await requireAdmin(req, res);
    if (admin) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ id: admin.id, email: admin.email });
    }
    return;
  }

  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }

  if (!isRecord(req.body)) {
    res.status(400).json({ error: 'A JSON request body is required.' });
    return;
  }

  const action = req.body['action'];
  if (action === 'logout') {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) {
      res.status(401).json({ error: 'Your session has already expired.' });
      return;
    }
    try {
      const { error } = await createServiceSupabaseClient().auth.admin.signOut(token, 'global');
      if (error) throw error;
      res.status(200).json({ message: 'Signed out.' });
    } catch (error) {
      sendServerError(res, error, 'Could not end the administrator session.');
    }
    return;
  }

  try {
    const supabase = createPublicSupabaseClient();
    let session;
    if (action === 'login') {
      const email = req.body['email'];
      const password = req.body['password'];
      if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
        res.status(400).json({ error: 'Enter your email address and password.' });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error || !data.session || !data.user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      if (!(await isAdministrator(data.user.id))) {
        res.status(403).json({ error: 'This account does not have administrator access.' });
        return;
      }
      session = data.session;
    } else if (action === 'refresh') {
      const refreshToken = req.body['refreshToken'];
      if (typeof refreshToken !== 'string' || !refreshToken) {
        res.status(400).json({ error: 'A refresh token is required.' });
        return;
      }

      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (error || !data.session || !data.user) {
        res.status(401).json({ error: 'Your session has expired. Sign in again.' });
        return;
      }
      if (!(await isAdministrator(data.user.id))) {
        res.status(403).json({ error: 'This account does not have administrator access.' });
        return;
      }
      session = data.session;
    } else {
      res.status(400).json({ error: 'Choose a supported authentication action.' });
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at
    });
  } catch (error) {
    sendServerError(res, error, 'Authentication service is unavailable.');
  }
}
