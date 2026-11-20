import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServiceSupabaseClient } from './_lib/supabase';
import { sendMethodNotAllowed, sendServerError } from './_lib/http';

const publicCollections = [
  ['site_settings', 'label'],
  ['page_sections', 'sort_order'],
  ['nav_links', 'sort_order'],
  ['partners', 'sort_order'],
  ['services', 'sort_order'],
  ['industries', 'sort_order'],
  ['benefits', 'sort_order'],
  ['process_steps', 'sort_order'],
  ['case_studies', 'sort_order'],
  ['team_members', 'sort_order'],
  ['testimonials', 'sort_order'],
  ['articles', 'sort_order'],
  ['faqs', 'sort_order'],
  ['legal_pages', 'slug']
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, ['GET']);
    return;
  }

  try {
    const supabase = createServiceSupabaseClient();
    const results = await Promise.all(publicCollections.map(async ([table, orderColumn]) => {
      let query = supabase.from(table).select('*').order(orderColumn, { ascending: true }).limit(500);
      if (table === 'page_sections') query = query.eq('enabled', true);
      else if (table === 'nav_links') query = query.eq('visible', true);
      else if (table === 'legal_pages') query = query.eq('published', true);
      else if (table !== 'site_settings') query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw new Error(`Could not load ${table}: ${error.message}`);
      return [table, data ?? []] as const;
    }));

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(Object.fromEntries(results));
  } catch (error) {
    sendServerError(res, error, 'Public site content is temporarily unavailable.');
  }
}
