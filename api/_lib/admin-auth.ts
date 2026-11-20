import { VercelRequest, VercelResponse } from '@vercel/node';
import { createPublicSupabaseClient, createServiceSupabaseClient } from './supabase';
import { sendServerError } from './http';

export interface AdminIdentity {
  id: string;
  email: string;
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<AdminIdentity | null> {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Sign in with an administrator account to continue.' });
    return null;
  }

  try {
    const authClient = createPublicSupabaseClient();
    const serviceClient = createServiceSupabaseClient();
    const { data: userResult, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userResult.user) {
      res.status(401).json({ error: 'Your session is invalid or has expired. Sign in again.' });
      return null;
    }

    const { data: admin, error: adminError } = await serviceClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userResult.user.id)
      .maybeSingle();

    if (adminError) {
      sendServerError(res, adminError, 'Could not verify administrator access.');
      return null;
    }
    if (!admin) {
      res.status(403).json({ error: 'This account does not have administrator access.' });
      return null;
    }

    return {
      id: userResult.user.id,
      email: userResult.user.email ?? ''
    };
  } catch (error) {
    sendServerError(res, error, 'Could not verify administrator access.');
    return null;
  }
}
