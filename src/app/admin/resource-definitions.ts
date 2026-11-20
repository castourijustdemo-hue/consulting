export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'checkbox' | 'json' | 'select';

export interface AdminField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  help?: string;
}

export interface ResourceDefinition {
  key: string;
  label: string;
  singular: string;
  columns: string[];
  fields: AdminField[];
}

const orderField: AdminField = { key: 'sort_order', label: 'Display order', type: 'number' };
const publishedField: AdminField = { key: 'published', label: 'Published on site', type: 'checkbox' };
const statusField: AdminField = {
  key: 'status',
  label: 'Status',
  type: 'select',
  options: ['new', 'in_progress', 'resolved']
};
const jsonField = (key: string, label: string, help?: string): AdminField => ({
  key,
  label,
  type: 'json',
  help: help ?? 'Enter valid JSON.'
});

export const RESOURCE_DEFINITIONS: ResourceDefinition[] = [
  {
    key: 'page_sections', label: 'Page sections', singular: 'Page section',
    columns: ['title', 'eyebrow', 'enabled', 'sort_order'],
    fields: [
      { key: 'slug', label: 'Section key', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'body', label: 'Body copy', type: 'textarea' },
      { key: 'image_url', label: 'Image URL', type: 'text' },
      jsonField('metadata', 'Additional data', 'Enter a JSON object such as {"buttonLabel":"Learn more"}.'),
      { key: 'enabled', label: 'Section enabled', type: 'checkbox' },
      orderField
    ]
  },
  {
    key: 'site_settings', label: 'Site settings', singular: 'Site setting',
    columns: ['label', 'key', 'value'],
    fields: [
      { key: 'key', label: 'Setting key', type: 'text', required: true },
      { key: 'label', label: 'Label', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'textarea', required: true }
    ]
  },
  {
    key: 'nav_links', label: 'Navigation links', singular: 'Navigation link',
    columns: ['label', 'href', 'group_name', 'visible', 'sort_order'],
    fields: [
      { key: 'label', label: 'Link label', type: 'text', required: true },
      { key: 'href', label: 'Link URL', type: 'text', required: true },
      { key: 'group_name', label: 'Menu group', type: 'text' },
      { key: 'visible', label: 'Visible on site', type: 'checkbox' },
      orderField
    ]
  },
  {
    key: 'partners', label: 'Trusted partners', singular: 'Partner',
    columns: ['name', 'published', 'sort_order'],
    fields: [
      { key: 'name', label: 'Partner name', type: 'text', required: true },
      publishedField, orderField
    ]
  },
  {
    key: 'services', label: 'Services', singular: 'Service',
    columns: ['title', 'category', 'published', 'sort_order'],
    fields: [
      { key: 'slug', label: 'Service key', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'summary', label: 'Summary', type: 'textarea', required: true },
      { key: 'image_url', label: 'Image URL', type: 'text' },
      jsonField('bullet_groups', 'Bullet groups', 'Enter a JSON array of arrays of strings.'),
      jsonField('details', 'Detail modal content', 'Enter a JSON object with badge, title, overview, and deliverables.'),
      publishedField, orderField
    ]
  },
  {
    key: 'industries', label: 'Industries', singular: 'Industry',
    columns: ['title', 'published', 'sort_order'],
    fields: [
      { key: 'title', label: 'Industry', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon_svg', label: 'Icon SVG', type: 'textarea' },
      publishedField, orderField
    ]
  },
  {
    key: 'benefits', label: 'Why choose us', singular: 'Benefit',
    columns: ['title', 'published', 'sort_order'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon_svg', label: 'Icon SVG', type: 'textarea' },
      publishedField, orderField
    ]
  },
  {
    key: 'process_steps', label: 'Process steps', singular: 'Process step',
    columns: ['title', 'description', 'published', 'sort_order'],
    fields: [
      { key: 'title', label: 'Step name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      orderField, publishedField
    ]
  },
  {
    key: 'case_studies', label: 'Case studies', singular: 'Case study',
    columns: ['title', 'category', 'industry', 'published'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Practice category', type: 'text', required: true },
      { key: 'industry', label: 'Industry label', type: 'text', required: true },
      { key: 'description', label: 'Card summary', type: 'textarea' },
      { key: 'image_url', label: 'Image URL', type: 'text' },
      jsonField('metrics', 'Outcome metrics', 'Enter a JSON array of objects with value and label.'),
      { key: 'challenge', label: 'Challenge', type: 'textarea' },
      { key: 'approach', label: 'Approach', type: 'textarea' },
      { key: 'outcome', label: 'Outcome', type: 'textarea' },
      publishedField, orderField
    ]
  },
  {
    key: 'team_members', label: 'Team members', singular: 'Team member',
    columns: ['name', 'role', 'published', 'sort_order'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'image_url', label: 'Image URL', type: 'text' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
      publishedField, orderField
    ]
  },
  {
    key: 'testimonials', label: 'Testimonials', singular: 'Testimonial',
    columns: ['author', 'company', 'industry', 'published'],
    fields: [
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
      { key: 'author', label: 'Author', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'industry', label: 'Industry', type: 'text' },
      { key: 'avatar_initials', label: 'Avatar initials', type: 'text' },
      { key: 'rating', label: 'Rating (1–5)', type: 'number' },
      publishedField, orderField
    ]
  },
  {
    key: 'articles', label: 'Insights & articles', singular: 'Article',
    columns: ['title', 'category', 'published_at', 'published'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'URL key', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'published_at', label: 'Publish date', type: 'date', required: true },
      { key: 'read_time', label: 'Read time (minutes)', type: 'number' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { key: 'body', label: 'Article body', type: 'textarea' },
      { key: 'image_url', label: 'Image URL', type: 'text' },
      publishedField, orderField
    ]
  },
  {
    key: 'faqs', label: 'FAQs', singular: 'FAQ',
    columns: ['question', 'published', 'sort_order'],
    fields: [
      { key: 'question', label: 'Question', type: 'textarea', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      publishedField, orderField
    ]
  },
  {
    key: 'legal_pages', label: 'Privacy & terms', singular: 'Legal page',
    columns: ['slug', 'title', 'published'],
    fields: [
      { key: 'slug', label: 'Page key (privacy or terms)', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'body', label: 'Page content', type: 'textarea', required: true },
      publishedField
    ]
  },
  {
    key: 'contact_messages', label: 'Contact enquiries', singular: 'Contact enquiry',
    columns: ['full_name', 'email', 'service', 'status', 'created_at'],
    fields: [
      { key: 'full_name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'service', label: 'Service', type: 'text' },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      statusField
    ]
  },
  {
    key: 'consultation_requests', label: 'Consultation requests', singular: 'Consultation request',
    columns: ['full_name', 'email', 'service', 'preferred_date', 'status'],
    fields: [
      { key: 'full_name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'service', label: 'Service', type: 'text', required: true },
      { key: 'preferred_date', label: 'Preferred date', type: 'date', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      statusField
    ]
  }
];
