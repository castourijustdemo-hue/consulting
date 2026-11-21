import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServiceSupabaseClient } from '../_lib/supabase.js';
import { requireAdmin } from '../_lib/admin-auth.js';
import { isRecord, sendMethodNotAllowed, sendServerError } from '../_lib/http.js';

const resources = {
  site_settings: { fields: ['key', 'value', 'label'], order: 'label' },
  page_sections: { fields: ['slug', 'title', 'eyebrow', 'subtitle', 'body', 'image_url', 'metadata', 'enabled', 'sort_order'], order: 'sort_order' },
  nav_links: { fields: ['label', 'href', 'group_name', 'visible', 'sort_order'], order: 'sort_order' },
  partners: { fields: ['name', 'sort_order', 'published'], order: 'sort_order' },
  services: { fields: ['slug', 'title', 'category', 'summary', 'image_url', 'bullet_groups', 'details', 'published', 'sort_order'], order: 'sort_order' },
  industries: { fields: ['title', 'description', 'icon_svg', 'published', 'sort_order'], order: 'sort_order' },
  benefits: { fields: ['title', 'description', 'icon_svg', 'published', 'sort_order'], order: 'sort_order' },
  process_steps: { fields: ['title', 'description', 'sort_order', 'published'], order: 'sort_order' },
  case_studies: { fields: ['title', 'category', 'industry', 'description', 'image_url', 'metrics', 'challenge', 'approach', 'outcome', 'published', 'sort_order'], order: 'sort_order' },
  team_members: { fields: ['name', 'role', 'image_url', 'linkedin_url', 'published', 'sort_order'], order: 'sort_order' },
  testimonials: { fields: ['quote', 'author', 'role', 'company', 'industry', 'avatar_initials', 'rating', 'published', 'sort_order'], order: 'sort_order' },
  articles: { fields: ['title', 'slug', 'category', 'published_at', 'read_time', 'excerpt', 'body', 'image_url', 'published', 'sort_order'], order: 'sort_order' },
  faqs: { fields: ['question', 'answer', 'published', 'sort_order'], order: 'sort_order' },
  legal_pages: { fields: ['slug', 'title', 'body', 'published'], order: 'slug' },
  contact_messages: { fields: ['full_name', 'email', 'phone', 'company', 'service', 'subject', 'message', 'status'], order: 'created_at' },
  consultation_requests: { fields: ['full_name', 'email', 'service', 'preferred_date', 'notes', 'status'], order: 'created_at' }
} as const;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function pickFields(input: Record<string, unknown>, fields: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => fields.includes(key) && value !== undefined)
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const resourceName = req.query['resource'];
  const name = Array.isArray(resourceName) ? resourceName[0] : resourceName;
  if (!name || !Object.prototype.hasOwnProperty.call(resources, name)) {
    res.status(404).json({ error: 'Unknown content resource.' });
    return;
  }
  const resource = resources[name as keyof typeof resources];
  const supabase = createServiceSupabaseClient();

  try {
    if (req.method === 'GET') {
      let query = supabase.from(name).select('*').order(resource.order, {
        ascending: resource.order !== 'created_at'
      }).limit(500);
      const { data, error } = await query;
      if (error) throw error;
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ rows: data ?? [] });
      return;
    }

    if (req.method === 'POST') {
      if (!isRecord(req.body)) {
        res.status(400).json({ error: 'A JSON object is required.' });
        return;
      }
      const values = pickFields(req.body, resource.fields);
      if (Object.keys(values).length === 0) {
        res.status(400).json({ error: 'Provide at least one editable field.' });
        return;
      }
      const { data, error } = await supabase.from(name).insert(values).select('*').single();
      if (error) throw error;
      res.status(201).json({ row: data });
      return;
    }

    if (req.method === 'PATCH') {
      if (!isRecord(req.body) || typeof req.body['id'] !== 'string' || !uuidPattern.test(req.body['id'])) {
        res.status(400).json({ error: 'A valid record ID is required.' });
        return;
      }
      const values = pickFields(req.body, resource.fields);
      if (Object.keys(values).length === 0) {
        res.status(400).json({ error: 'Provide at least one editable field.' });
        return;
      }
      const { data, error } = await supabase.from(name).update(values).eq('id', req.body['id']).select('*').single();
      if (error) throw error;
      res.status(200).json({ row: data });
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query['id'];
      if (typeof id !== 'string' || !uuidPattern.test(id)) {
        res.status(400).json({ error: 'A valid record ID is required.' });
        return;
      }
      const { data, error } = await supabase.from(name).delete().eq('id', id).select('id').single();
      if (error) throw error;
      res.status(200).json({ id: data.id });
      return;
    }

    sendMethodNotAllowed(res, ['GET', 'POST', 'PATCH', 'DELETE']);
  } catch (error) {
    sendServerError(res, error, `Could not ${req.method?.toLowerCase() ?? 'process'} ${name}.`);
  }
}
