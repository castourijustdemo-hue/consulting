insert into public.site_settings (key, value, label) values
  ('brand_name', 'Vanguard & Sterling Advisory', 'Brand name'),
  ('brand_logo_url', '/images/Logo-1.png', 'Brand logo URL'),
  ('office_address', 'Level 32, Sterling Financial Tower, 100 Bishopsgate, Financial District', 'Office address'),
  ('phone', '+1 (555) 234-8900 / +44 (0) 20 7946 0821', 'Phone'),
  ('email', 'advisory@vanguardsterling-example.com', 'Email'),
  ('business_hours', 'Monday – Friday: 08:30 AM – 06:30 PM', 'Business hours')
on conflict (key) do nothing;

insert into public.page_sections (slug, title, eyebrow, subtitle, body, image_url, enabled, sort_order) values
  ('hero', 'Building Stronger Businesses Through Expert Guidance.', 'YOUR TRUSTED PROFESSIONAL PARTNER', 'We deliver strategic business consulting, trusted legal advisory and comprehensive HR solutions to help organizations grow, transform and succeed.', '', '/images/top-img-banner.png', true, 10),
  ('about', 'Expertise That Moves Your Business Forward.', 'About Vanguard & Sterling', 'We are a multidisciplinary professional services firm committed to helping businesses navigate challenges, unlock opportunities and achieve sustainable growth.', 'Founded on the conviction that commercial strategy, regulatory certainty, and human capital performance are inseparable, Vanguard & Sterling unites senior management consultants, corporate legal counsel, and organizational psychologists under one cohesive partnership.', '/images/about-boardroom.png', true, 20),
  ('services', 'Our Core Services', 'Integrated Advisory Practices', 'Three specialized disciplines working in concert to safeguard compliance, accelerate expansion, and elevate organizational capability.', '', '', true, 30),
  ('why-us', 'Your Success Is Our Professional Commitment.', 'The V&S Advantage', 'Unlike fragmented vendors, Vanguard & Sterling aligns commercial strategy, statutory protection, and workforce architecture into one accountable advisory team—eliminating blind spots and accelerating execution.', '', '', false, 40),
  ('industries', 'Industries We Serve', 'Sector Specialization', 'Deep domain fluency across ten vital economic sectors, enabling tailored regulatory, operational, and talent insights.', '', '', false, 50),
  ('process', 'A Clear Path From Challenge to Achievement.', 'Methodology', 'Our disciplined four-stage engagement framework ensures clarity, transparency, and measurable value at every milestone.', '', '', true, 60),
  ('cases', 'Real Challenges. Meaningful Results.', 'Proven Track Record', 'Explore illustrative engagements demonstrating how our integrated consulting, legal, and HR teams create lasting enterprise impact.', '', '', true, 70),
  ('team', 'Meet the Experts Behind Your Success.', 'Leadership & Partners', '', '', '', true, 80),
  ('testimonials', 'Trusted by Businesses. Valued by People.', 'Client Endorsements', 'Illustrative reflections from executive leaders who partner with Vanguard & Sterling across strategy, law, and human capital.', '', '', true, 90),
  ('insights', 'Knowledge That Creates Opportunities.', 'Thought Leadership', 'Executive briefings, regulatory analyses, and organizational playbooks authored by our practice leaders.', '', '', true, 100),
  ('faq', 'Frequently Asked Questions', 'Advisory Clarity', '', '', '', true, 110),
  ('contact', 'Connect With Our Advisory Team', 'Direct Engagement', 'Reach out to discuss your strategic priorities, legal requirements, or human capital initiatives in complete confidence.', '', '', true, 120),
  ('cta', 'Let''s Build Something Exceptional Together.', 'Executive Partnership', 'Connect with our professional team and discover the right solutions for your business.', '', '/images/cta-banner.png', true, 130)
on conflict (slug) do nothing;

insert into public.nav_links (label, href, group_name, sort_order) values
  ('Home', '#home', 'primary', 10),
  ('About Us', '#about', 'primary', 20),
  ('Services', '#services', 'primary', 30),
  ('Industries', '#industries', 'primary', 40),
  ('Our Team', '#team', 'primary', 50),
  ('Case Studies', '#cases', 'primary', 60),
  ('Insights', '#insights', 'primary', 70),
  ('Contact', '#contact', 'primary', 80)
on conflict do nothing;

insert into public.partners (name, sort_order) values
  ('AURELIA CAPITAL BANK', 10),
  ('NORDIK GLOBAL LOGISTICS', 20),
  ('HELIOS MEDTECH GROUP', 30),
  ('MERIDIAN CLOUD SYSTEMS', 40),
  ('APEX HEAVY INDUSTRIES', 50),
  ('OXBRIDGE ACADEMIC TRUST', 60),
  ('SOVEREIGN ESTATES REIT', 70),
  ('VERDANT ENERGY HOLDINGS', 80)
on conflict (name) do nothing;

insert into public.services (slug, title, category, summary, image_url, bullet_groups, details, sort_order) values
  ('business', 'Business Consulting', 'Business Consulting', 'Strategic insights and practical solutions that strengthen business performance and create sustainable opportunities.', '/images/service-1.png',
   '[["Business Strategy & Planning","Corporate Advisory","Business Development","Management Consulting"],["Financial Planning","Risk Management","Digital Transformation","Operational Excellence"]]'::jsonb,
   '{"badge":"Practice 01 • Business Consulting","title":"Strategic & Operational Business Consulting","overview":"We partner with CEOs, founders, and boards to solve complex growth, profitability, and transformation challenges with analytical rigor.","deliverables":["5-Year Corporate Growth & Market Entry Blueprints","M&A Commercial Due Diligence & Post-Merger Integration","Financial Modeling, Working Capital & Margin Optimization","Enterprise Risk Management & Digital Operating Models"]}'::jsonb, 10),
  ('legal', 'Legal Services', 'Legal Services', 'Professional legal guidance and corporate advisory services designed to protect business interests and support compliance.', '/images/service-2.png',
   '[["Corporate Legal Advisory","Business Registration Support","Contract Drafting & Review","Employment Law Advisory"],["Corporate Compliance","Intellectual Property Advisory","Commercial Agreements","Legal Risk Assessment"]]'::jsonb,
   '{"badge":"Practice 02 • Legal Services","title":"Corporate Legal & Regulatory Advisory","overview":"Proactive commercial counsel designed to protect enterprise assets, streamline transactions, and ensure continuous statutory compliance.","deliverables":["Entity Incorporation, Shareholder & Joint-Venture Agreements","Commercial Contract Drafting, Negotiation & Lifecycle Audits","Employment Law Governance & Executive Severance Advisory","Trademark, Patent & Proprietary IP Portfolio Protection"]}'::jsonb, 20),
  ('hr', 'HR Consulting', 'HR Consulting', 'People-focused solutions that help organizations attract talent, develop leadership and build high-performing teams.', '/images/service-3.png',
   '[["Recruitment & Talent Acquisition","HR Strategy & Planning","Employee Engagement","Performance Management"],["Training & Development","Workforce Planning","Organizational Development","Compensation & Benefits Advisory"]]'::jsonb,
   '{"badge":"Practice 03 • HR Consulting","title":"Strategic Human Capital & Organizational Consulting","overview":"Aligning talent strategy with business ambition to attract high-caliber leaders, elevate engagement, and future-proof your workforce.","deliverables":["Executive Search & High-Volume Talent Acquisition Frameworks","Compensation Benchmarking, Bonus & ESOP Architecture","Performance Management & Leadership Competency Academies","Organizational Design & Change Management Programs"]}'::jsonb, 30)
on conflict (slug) do nothing;

insert into public.process_steps (title, description, sort_order) values
  ('DISCOVER', 'Understand your business, goals and challenges.', 10),
  ('STRATEGIZE', 'Develop tailored strategies and practical solutions.', 20),
  ('IMPLEMENT', 'Execute solutions with expert guidance and collaboration.', 30),
  ('GROW', 'Measure results, optimize performance and support long-term success.', 40)
on conflict (title) do nothing;

insert into public.case_studies (title, category, industry, description, image_url, metrics, challenge, approach, outcome, sort_order) values
  ('Post-Merger Operational Turnaround & Margin Expansion', 'business', 'Manufacturing • Business Consulting', 'Restructured regional supply chains and financial controls for a mid-cap industrial manufacturer following cross-border acquisition.', '/images/case-study-1.png',
   '[{"value":"+34%","label":"EBITDA Margin Gain"},{"value":"$18.5M","label":"Annualized Cost Savings"}]'::jsonb,
   'Following a cross-border acquisition, a mid-cap industrial manufacturer faced duplicated regional supply chains, declining EBITDA margins, and fragmented ERP reporting across four production facilities.',
   'Vanguard & Sterling deployed a joint Strategy and Financial Advisory team to consolidate procurement contracts, redesign plant-floor KPI governance, and implement zero-based budgeting.',
   'Within nine months, the client achieved +34% EBITDA margin expansion, $18.5M in annualized run-rate savings, and unified board-level financial visibility.', 10),
  ('Multi-Jurisdiction Regulatory Licensing & IP Architecture', 'legal', 'Banking & FinTech • Legal Services', 'Designed corporate governance, commercial vendor frameworks, and IP ring-fencing for a digital payments platform expanding into 6 markets.', '/images/case-study-2.png',
   '[{"value":"100%","label":"Audit Approval Rate"},{"value":"4.5 Mos","label":"Faster Market Entry"}]'::jsonb,
   'A rapidly scaling B2B payments platform required regulatory authorization, cross-border commercial agreements, and core algorithmic IP protection across six jurisdictions.',
   'Our Corporate Legal Advisors structured an IP holding subsidiary, drafted standardized enterprise SaaS MSAs, and led regulatory compliance filings with local financial authorities.',
   '100% first-pass regulatory audit approval and a 4.5-month acceleration in commercial market launch across target territories.', 20),
  ('Enterprise Leadership Academy & Retention Transformation', 'hr', 'Healthcare & Medical • HR Consulting', 'Overhauled compensation benchmarks, clinical leadership pathways, and engagement programs across a 2,400-employee hospital network.', '/images/case-study-3.png',
   '[{"value":"-41%","label":"Senior Attrition Drop"},{"value":"92%","label":"Leadership Bench Readiness"}]'::jsonb,
   'A 2,400-employee multi-specialty healthcare network experienced 26% annual attrition among senior clinical directors and lacked structured succession pathways.',
   'Our HR Consultants benchmarked total rewards against top-quartile peers, launched a clinical leadership fellowship, and instituted transparent bi-annual performance calibration.',
   'Senior attrition dropped by 41% within two quarters, while internal leadership bench readiness rose to 92%.', 30)
on conflict (title) do nothing;

insert into public.team_members (name, role, image_url, published, sort_order) values
  ('Alexander Vance, MBA', 'Managing Director', '/images/leader-1.png', true, 10),
  ('Inaya, Sterling-Hayes', 'Business Consultant', '/images/leader-2.png', true, 20),
  ('Marcus Thorne, LL.M.', 'Corporate Legal Advisor', '/images/leader-3.png', true, 30),
  ('Dr. Elena, SHRM-SCP', 'HR Consultant', '/images/leader-4.png', true, 40),
  ('Julian Mercer, CFA', 'Strategy Specialist', '/images/leader-5.png', true, 50),
  ('Sophia Chen-Alvarez, MSc', 'Senior Business Analyst', '/images/leader-6.png', true, 60)
on conflict (name) do nothing;

insert into public.testimonials (quote, author, role, company, industry, avatar_initials, rating, sort_order) values
  ('Vanguard & Sterling guided our regional expansion with remarkable clarity. Having corporate legal counsel and commercial strategists collaborating at the same table cut our execution timeline in half.', 'Jonathan Hargreaves (Client Placeholder)', 'Chief Executive Officer', 'Aurelia Capital Holdings', 'Banking & Financial Services', 'JH', 5, 10),
  ('Their HR consulting practice transformed how we attract and retain senior clinical leaders. Turnover dropped dramatically within two quarters, and our leadership bench has never been stronger.', 'Dr. Claire Montgomery (Client Placeholder)', 'Managing Partner', 'Helios MedTech Group', 'Healthcare & Medical', 'CM', 5, 20),
  ('From Series B governance restructuring to enterprise IP protection and ESOP design, V&S Global acted as a true strategic partner rather than an external vendor.', 'Rohan Kulkarni (Client Placeholder)', 'Co-Founder & COO', 'Meridian Cloud Systems', 'Information Technology', 'RK', 5, 30)
on conflict (author) do nothing;

insert into public.articles (title, slug, category, published_at, read_time, excerpt, body, image_url, sort_order) values
  ('Capital Allocation & Resilient Growth in Volatile Markets', 'capital-allocation-resilient-growth', 'Business Strategy & Growth', '2026-10-18', 6, 'How disciplined CFOs and boards balance defensive liquidity with strategic M&A and digital core investments.', 'In periods of shifting interest rates and supply chain realignment, outperforming enterprises avoid across-the-board retrenchment. Instead, top-quartile leadership teams ring-fence core cash-generating units while reallocating 15–20% of capital expenditure toward high-margin digital automation and strategic bolt-on acquisitions.', '/images/article-1.png', 10),
  ('Cross-Border Data Governance & AI Contracting Standards', 'cross-border-data-governance-ai-contracts', 'Corporate Legal Compliance', '2026-10-04', 5, 'Essential clauses, liability caps, and regulatory audit protocols every enterprise general counsel must review this year.', 'As enterprise software vendors embed generative AI into mission-critical workflows, corporate legal teams must update Master Services Agreements to address training-data isolation, intellectual property indemnification, and cross-border data residency compliance.', '/images/article-2.png', 20),
  ('Total Rewards Architecture for High-Retention Organizations', 'total-rewards-high-retention', 'Human Resource Management', '2026-09-21', 7, 'Designing transparent performance incentives and non-monetary career pathways that outperform market attrition averages.', 'Competitive base salary alone no longer secures scarce leadership talent. High-retention organizations combine transparent career architecture, performance-linked equity or profit participation, and targeted executive coaching to sustain long-term engagement.', '/images/article-3.png', 30),
  ('Building Agile C-Suite Alignment During Digital Transformation', 'agile-c-suite-digital-transformation', 'Leadership & Org Development', '2026-09-09', 6, 'Eliminating departmental silos through shared governance rituals, executive coaching, and outcome-driven OKRs.', 'Over 60% of enterprise transformation programs stall due to misaligned incentives between Finance, Legal, IT, and Operations. Establishing a unified Transformation Management Office with shared quarterly milestones ensures rapid, compliant execution.', '/images/article-4.png', 40)
on conflict (slug) do nothing;

insert into public.faqs (question, answer, sort_order) values
  ('What services does your consulting company provide?', 'Vanguard & Sterling Advisory provides comprehensive professional services across three core practices: Business Consulting (strategy, financial planning, risk management, digital transformation, operational excellence), Legal Services (corporate legal advisory, compliance, contracts), and HR Consulting (talent acquisition, organizational strategy, leadership development).', 10),
  ('How can I schedule a consultation?', 'You can click any “Schedule a Consultation” button on this page to select your preferred practice area, date, and time window, or submit an enquiry through our Contact section. A senior practice coordinator responds within one business day to confirm your confidential discovery session.', 20),
  ('Do you provide customized business solutions?', 'Yes. We never rely on off-the-shelf templates. Every engagement begins with our Discover phase—auditing your commercial objectives, regulatory environment, and organizational structure—to engineer a bespoke roadmap tailored specifically to your enterprise.', 30),
  ('Can businesses access all three consulting services?', 'Absolutely. Many clients retain us for integrated multi-disciplinary mandates—such as market expansion, mergers & acquisitions, or corporate restructuring—where our Business, Legal, and HR specialists work as a single unified project team.', 40),
  ('How do you protect client confidentiality?', 'Client discretion is foundational to our firm. All discussions are protected by mutual Non-Disclosure Agreements (NDAs), strict ethical walls, encrypted document vaults, and ISO 27001-aligned information governance standards.', 50)
on conflict (question) do nothing;

insert into public.legal_pages (slug, title, body) values
  ('privacy', 'Privacy & Data Protection Policy', 'Vanguard & Sterling Advisory respects your corporate and personal privacy. Information submitted via our consultation or enquiry interfaces is processed strictly for client engagement evaluation under ISO 27001-aligned confidentiality controls and is never sold or shared with unauthorized third parties.'),
  ('terms', 'Terms & Conditions of Use', 'Materials published on this corporate website are provided for general executive information and do not constitute formal legal, financial, or tax advice until a formal Letter of Engagement is executed with Vanguard & Sterling Advisory.')
on conflict (slug) do nothing;

update public.page_sections
set metadata = '{"title_highlight":"Expert Guidance."}'::jsonb
where slug = 'hero' and metadata = '{}'::jsonb;

update public.page_sections
set metadata = '{"metrics":[{"value":"98%","label":"Client Satisfaction Score"},{"value":"38+","label":"Jurisdictions Covered"},{"value":"100%","label":"NDA & Ethics Governance"},{"value":"3x","label":"Average Client ROI"}]}'::jsonb
where slug = 'why-us' and metadata = '{}'::jsonb;

insert into public.industries (title, description, sort_order) values
  ('Banking & Financial Services', 'Regulatory governance, risk modeling, fintech compliance, and executive leadership succession.', 10),
  ('Healthcare & Medical', 'Clinical operations optimization, healthcare compliance, licensing, and specialist talent retention.', 20),
  ('Information Technology', 'IP protection, SaaS scaling strategy, data privacy frameworks, and engineering workforce design.', 30),
  ('Manufacturing', 'Lean supply chains, commercial vendor contracts, industrial safety compliance, and workforce planning.', 40),
  ('Retail & E-commerce', 'Omnichannel transformation, consumer law compliance, brand IP defense, and peak-season HR agility.', 50),
  ('Real Estate & Construction', 'Joint-venture structuring, project finance advisory, construction contracts, and safety governance.', 60),
  ('Education', 'Institutional accreditation governance, ed-tech partnerships, faculty frameworks, and strategic growth.', 70),
  ('Startups & SMEs', 'Incorporation, Series A–C readiness, ESOP & employment contracts, and scalable operating models.', 80),
  ('Hospitality', 'Franchise & management agreements, service excellence training, and multi-property HR systems.', 90),
  ('Logistics & Transportation', 'Cross-border trade compliance, fleet optimization, carrier agreements, and workforce safety programs.', 100)
on conflict (title) do nothing;

insert into public.benefits (title, description, sort_order) values
  ('Experienced Professionals', 'Senior partners with decades of C-suite, legal counsel, and global HR leadership credentials.', 10),
  ('Client-Centered Approach', 'Every engagement is bespoke—calibrated to your corporate culture, risk appetite, and growth horizon.', 20),
  ('Integrated Business Solutions', 'Seamless synergy across Strategy, Legal, and HR prevents costly friction during M&A or scaling.', 30),
  ('Strategic Thinking', 'Data-backed market foresight combined with pragmatic roadmaps built for real-world execution.', 40),
  ('Confidentiality & Trust', 'Bank-grade information security, strict conflict-of-interest protocols, and unwavering discretion.', 50),
  ('Results-Driven Execution', 'Clear KPIs, milestone accountability, and hands-on implementation support until value is realized.', 60)
on conflict (title) do nothing;
