import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type CmsRecord = Record<string, unknown>;
export type PublicSiteContent = Record<string, CmsRecord[]>;

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private readonly http = inject(HttpClient);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
  private readonly document = inject(DOCUMENT);

  load(): Observable<PublicSiteContent> {
    return this.http.get<PublicSiteContent>('/api/content');
  }

  hydrate(content: PublicSiteContent): void {
    this.hydrateSections(content['page_sections'] ?? []);
    this.hydrateSettings(content['site_settings'] ?? []);
    this.hydrateNavigation(content['nav_links'] ?? []);
    this.hydrateOptionalSections(content['page_sections'] ?? [], content);
    this.hydratePartners(content['partners'] ?? []);
    this.hydrateServices(content['services'] ?? []);
    this.hydrateServiceOptions(content['services'] ?? []);
    this.hydrateProcess(content['process_steps'] ?? []);
    this.hydrateCases(content['case_studies'] ?? []);
    this.hydrateTeam(content['team_members'] ?? []);
    this.hydrateTestimonials(content['testimonials'] ?? []);
    this.hydrateArticles(content['articles'] ?? []);
    this.hydrateFaqs(content['faqs'] ?? []);
    this.hydrateLegalPages(content['legal_pages'] ?? []);
  }

  private hydrateSections(rows: CmsRecord[]): void {
    const sectionSelectors: Record<string, { root: string; title: string; eyebrow?: string; subtitle?: string; body?: string; image?: string }> = {
      hero: { root: '#home', title: '.hero-title', eyebrow: '.hero-eyebrow', subtitle: '.hero-desc', image: '.hero-banner-img' },
      about: { root: '#about', title: '.section-title', eyebrow: '.eyebrow', subtitle: '.section-subtitle', body: '.section-subtitle + p', image: '.about-visual-frame img' },
      services: { root: '#services', title: '.section-title', eyebrow: '.eyebrow', subtitle: '.section-subtitle' },
      process: { root: '#process', title: '.section-title', eyebrow: '.eyebrow', subtitle: '.section-subtitle' },
      cases: { root: '#cases', title: '.section-title', eyebrow: '.eyebrow', subtitle: '.section-subtitle' },
      team: { root: '#team', title: '.section-title', eyebrow: '.eyebrow' },
      testimonials: { root: '#testimonials', title: '.section-title', eyebrow: '.eyebrow', subtitle: '.section-subtitle' },
      insights: { root: '#insights', title: '.section-title', eyebrow: '.eyebrow', subtitle: '.section-subtitle' },
      faq: { root: '#faq', title: '.section-title', eyebrow: '.eyebrow' },
      contact: { root: '#contact', title: '.section-title', eyebrow: '.eyebrow', subtitle: '.section-subtitle' },
      cta: { root: '.cta-banner', title: '.cta-banner-text h2', eyebrow: '.cta-banner-text .eyebrow', subtitle: '.cta-banner-text p', image: '.cta-banner-img' }
    };

    for (const row of rows) {
      const slug = this.text(row, 'slug');
      const selectors = sectionSelectors[slug];
      if (!selectors) continue;
      const root = this.document.querySelector(selectors.root);
      if (!root) continue;

      const title = this.text(row, 'title');
      const eyebrow = this.text(row, 'eyebrow');
      const subtitle = this.text(row, 'subtitle');
      const body = this.text(row, 'body');
      if (title) {
        const element = root.querySelector(selectors.title);
        if (element) {
          if (slug === 'hero') this.setHeroTitle(element, title, row['metadata']);
          else this.setText(element, title);
        }
      }
      if (eyebrow && selectors.eyebrow) this.setText(root.querySelector(selectors.eyebrow), eyebrow);
      const summary = subtitle || body;
      if (summary && selectors.subtitle) this.setText(root.querySelector(selectors.subtitle), summary);
      if (body && subtitle && selectors.body) this.setText(root.querySelector(selectors.body), body);
      const image = this.safeImageUrl(this.text(row, 'image_url'));
      if (image && selectors.image) {
        const imageElement = root.querySelector(selectors.image);
        if (imageElement) this.renderer.setAttribute(imageElement, 'src', image);
      }
    }
  }

  private setHeroTitle(element: Element, title: string, metadata: unknown): void {
    const highlight = this.text(this.record(metadata), 'title_highlight') ||
      (title.endsWith('Expert Guidance.') ? 'Expert Guidance.' : '');
    const highlightIndex = highlight ? title.lastIndexOf(highlight) : -1;
    if (highlightIndex < 0 || !highlight) {
      this.setText(element, title);
      return;
    }
    element.replaceChildren();
    element.append(this.document.createTextNode(title.slice(0, highlightIndex)));
    const span = this.document.createElement('span');
    span.textContent = highlight;
    element.append(span);
  }

  private hydrateSettings(rows: CmsRecord[]): void {
    const settings = new Map(rows.map(row => [this.text(row, 'key'), this.text(row, 'value')]));
    const brandName = settings.get('brand_name');
    if (brandName) {
      this.document.title = brandName;
      this.document.querySelectorAll('.brand-logo').forEach(brand => {
        this.renderer.setAttribute(brand, 'aria-label', `${brandName} Home`);
      });
    }
    const logoUrl = this.safeImageUrl(settings.get('brand_logo_url') ?? '');
    if (logoUrl) {
      this.document.querySelectorAll('.brand-mark').forEach(logo => this.renderer.setAttribute(logo, 'src', logoUrl));
    }

    const details = this.document.querySelectorAll('#contact .contact-detail-item span');
    const contactKeys = ['office_address', 'phone', 'email', 'business_hours'];
    contactKeys.forEach((key, index) => {
      this.setText(details.item(index), settings.get(key) ?? '');
    });

    const footerContact = this.document.querySelectorAll('.footer-contact-list li');
    const footerKeys = ['office_address', 'phone', 'email', 'business_hours'];
    footerKeys.forEach((key, index) => {
      const value = settings.get(key) ?? '';
      const prefix = ['Office: ', 'Phone: ', 'Email: ', 'Hours: '][index];
      this.setText(footerContact.item(index), value ? `${prefix}${value}` : '');
    });
    const phone = settings.get('phone')?.split('/')[0].replace(/\D/g, '');
    this.document.querySelectorAll('.float-whatsapp, .whatsapp-direct-btn').forEach(link => {
      this.renderer.setAttribute(link, 'href', phone ? `https://wa.me/${phone}` : '#contact');
    });
  }

  private hydrateOptionalSections(rows: CmsRecord[], content: PublicSiteContent): void {
    const whyUs = rows.find(row => this.text(row, 'slug') === 'why-us');
    if (whyUs && !this.document.querySelector('#why-us')) {
      const section = this.createWhyUsSection(whyUs, content['benefits'] ?? []);
      this.document.querySelector('#services')?.insertAdjacentElement('afterend', section);
    }

    const industries = rows.find(row => this.text(row, 'slug') === 'industries');
    if (industries && !this.document.querySelector('#industries')) {
      const section = this.createIndustriesSection(industries, content['industries'] ?? []);
      (this.document.querySelector('#why-us') ?? this.document.querySelector('#services'))
        ?.insertAdjacentElement('afterend', section);
    }
  }

  private createWhyUsSection(sectionData: CmsRecord, benefits: CmsRecord[]): HTMLElement {
    const section = this.document.createElement('section');
    section.className = 'section';
    section.id = 'why-us';
    const container = this.createElement('div', 'container why-grid');
    const visual = this.createElement('div', 'why-visual-card reveal');
    this.appendText(visual, 'span', 'eyebrow', this.text(sectionData, 'eyebrow'));
    this.appendText(visual, 'h2', '', this.text(sectionData, 'title'));
    this.appendText(visual, 'p', '', this.text(sectionData, 'subtitle'));
    const metrics = this.recordArray(this.record(sectionData['metadata'])['metrics']);
    if (metrics.length) {
      const metricsGrid = this.createElement('div', 'why-metrics');
      metrics.forEach(metric => {
        const item = this.createElement('div', 'why-metric-box');
        this.appendText(item, 'strong', '', this.text(metric, 'value'));
        this.appendText(item, 'span', '', this.text(metric, 'label'));
        metricsGrid.append(item);
      });
      visual.append(metricsGrid);
    }
    container.append(visual);

    const featureGrid = this.createElement('div', 'features-grid');
    benefits.forEach((benefit, index) => {
      const card = this.createElement('div', `feature-card reveal${index % 2 ? ' reveal-delay-1' : ''}`);
      const icon = this.createElement('div', 'feature-icon');
      icon.append(this.createMarkIcon());
      card.append(icon);
      this.appendText(card, 'h3', '', this.text(benefit, 'title'));
      this.appendText(card, 'p', '', this.text(benefit, 'description'));
      featureGrid.append(card);
    });
    container.append(featureGrid);
    section.append(container);
    return section;
  }

  private createIndustriesSection(sectionData: CmsRecord, industries: CmsRecord[]): HTMLElement {
    const section = this.document.createElement('section');
    section.className = 'section section-alt';
    section.id = 'industries';
    const container = this.createElement('div', 'container');
    const heading = this.createElement('div', 'section-header centered reveal');
    this.appendText(heading, 'span', 'eyebrow', this.text(sectionData, 'eyebrow'));
    this.appendText(heading, 'h2', 'section-title', this.text(sectionData, 'title'));
    this.appendText(heading, 'p', 'section-subtitle', this.text(sectionData, 'subtitle'));
    container.append(heading);

    const wrapper = this.createElement('div', 'industries-slider-wrapper reveal');
    const previous = this.createArrowButton('industriesPrevBtn', 'Previous industries', 'prev');
    const viewport = this.createElement('div', 'industries-slider-viewport');
    viewport.id = 'industriesViewport';
    const track = this.createElement('div', 'industries-slider-track');
    track.id = 'industriesTrack';
    industries.forEach(industry => {
      const card = this.createElement('article', 'industry-card');
      const icon = this.createElement('div', 'industry-icon');
      icon.append(this.createMarkIcon());
      card.append(icon);
      this.appendText(card, 'h3', '', this.text(industry, 'title'));
      this.appendText(card, 'p', '', this.text(industry, 'description'));
      track.append(card);
    });
    viewport.append(track);
    wrapper.append(previous, viewport, this.createArrowButton('industriesNextBtn', 'Next industries', 'next'));
    container.append(wrapper);

    const dots = this.createElement('div', 'slider-dots industries-dots');
    const pageCount = Math.max(1, Math.ceil(industries.length / 5));
    for (let index = 0; index < pageCount; index++) {
      const dot = this.document.createElement('button');
      dot.type = 'button';
      dot.className = `slider-dot${index === 0 ? ' active' : ''}`;
      dot.dataset['slide'] = String(index);
      dot.setAttribute('aria-label', `Industries page ${index + 1}`);
      dots.append(dot);
    }
    container.append(dots);
    section.append(container);
    return section;
  }

  private createArrowButton(id: string, label: string, direction: 'prev' | 'next'): HTMLButtonElement {
    const button = this.document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.className = `industries-arrow ${direction}`;
    button.setAttribute('aria-label', label);
    button.title = label;
    const svg = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    const path = this.document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', direction === 'prev' ? 'M19 12H5M12 19l-7-7 7-7' : 'M5 12h14M12 5l7 7-7 7');
    svg.append(path);
    button.append(svg);
    return button;
  }

  private createMarkIcon(): SVGSVGElement {
    const svg = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('aria-hidden', 'true');
    const path = this.document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z');
    svg.append(path);
    return svg;
  }

  private hydrateNavigation(rows: CmsRecord[]): void {
    const visible = rows.filter(row => row['visible'] !== false && this.text(row, 'group_name') === 'primary');
    const desktop = this.document.querySelector('.nav-menu');
    const mobile = this.document.querySelector('.mobile-nav-list');
    if (!desktop || !mobile) return;
    const desktopTemplates = new Map<string, Element>();
    desktop.querySelectorAll(':scope > li').forEach(item => {
      const link = item.querySelector('a.nav-link');
      if (link) desktopTemplates.set(link.getAttribute('href') ?? '', item);
    });
    const serviceMobileLinks = mobile.querySelector('a[href="#services"]')?.parentElement?.querySelector('.mobile-sublinks');

    const desktopItems = this.document.createDocumentFragment();
    const mobileItems = this.document.createDocumentFragment();
    for (const row of visible) {
      const label = this.text(row, 'label');
      const href = this.safeHref(this.text(row, 'href'));
      if (!label || !href) continue;

      const existingDesktop = desktopTemplates.get(href);
      let desktopItem: Element;
      if (existingDesktop) {
        const cloned = existingDesktop.cloneNode(true);
        if (!(cloned instanceof Element)) continue;
        desktopItem = cloned;
      } else {
        const item = this.document.createElement('li');
        const link = this.document.createElement('a');
        link.className = 'nav-link';
        item.append(link);
        desktopItem = item;
      }
      const desktopLink = desktopItem.querySelector('a.nav-link');
      if (desktopLink) {
        this.setAnchorLabel(desktopLink, label);
        this.renderer.setAttribute(desktopLink, 'href', href);
        this.renderer.setAttribute(desktopLink, 'data-nav', href.replace(/^#/, ''));
      }
      desktopItems.append(desktopItem);

      const mobileItem = this.document.createElement('li');
      const mobileLink = this.document.createElement('a');
      mobileLink.className = 'mobile-nav-link';
      mobileLink.textContent = label;
      this.renderer.setAttribute(mobileLink, 'href', href);
      mobileItem.append(mobileLink);
      if (href === '#services' && serviceMobileLinks) {
        const sublinks = serviceMobileLinks.cloneNode(true);
        if (sublinks instanceof Element) mobileItem.append(sublinks);
      }
      mobileItems.append(mobileItem);
    }
    desktop.replaceChildren(desktopItems);
    mobile.replaceChildren(mobileItems);
  }

  private setAnchorLabel(anchor: Element, label: string): void {
    Array.from(anchor.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) node.remove();
    });
    const icon = anchor.querySelector('svg');
    anchor.insertBefore(this.document.createTextNode(`${label} `), icon);
  }

  private hydratePartners(rows: CmsRecord[]): void {
    const track = this.document.querySelector('.marquee-track');
    if (!track) return;
    const templates = Array.from(track.querySelectorAll('.partner-logo-item')).slice(0, 8);
    if (!templates.length) {
      if (!rows.length) track.replaceChildren();
      return;
    }
    const fragment = this.document.createDocumentFragment();
    for (let index = 0; index < rows.length * 2; index++) {
      const template = templates[index % templates.length];
      const cloned = template.cloneNode(true);
      if (!(cloned instanceof HTMLElement)) continue;
      cloned.setAttribute('aria-hidden', index >= rows.length ? 'true' : 'false');
      const name = this.text(rows[index % rows.length], 'name');
      const textNode = Array.from(cloned.childNodes).reverse().find(node => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = `\n            ${name}\n          `;
      fragment.append(cloned);
    }
    track.replaceChildren(fragment);
  }

  private hydrateServices(rows: CmsRecord[]): void {
    this.replaceCards('.services-slider-track', '.service-slide-card', rows, (card, row, index) => {
      const slug = this.text(row, 'slug');
      const title = this.text(row, 'title');
      this.setText(card.querySelector('.service-card-heading'), title);
      this.setText(card.querySelector('.service-card-summary'), this.text(row, 'summary'));
      this.setImage(card.querySelector('.service-card-thumb'), row);
      card.setAttribute('data-service-card', slug);
      card.setAttribute('data-service-detail', slug);
      card.setAttribute('aria-label', `${title} Practice`);
      const button = card.querySelector('.service-card-link');
      if (button) {
        button.setAttribute('data-service-detail', slug);
        button.setAttribute('aria-label', `Explore ${title} Details`);
      }
      const bulletContainer = card.querySelector('.service-card-bullets');
      if (bulletContainer) {
        bulletContainer.replaceChildren();
        this.stringGroups(row['bullet_groups']).forEach(group => {
          const list = this.createElement('ul', 'service-bullet-col');
          this.replaceTextList(list, group);
          bulletContainer.append(list);
        });
      }
      card.setAttribute('data-slide-index', String(index));
    });
  }

  private hydrateServiceOptions(rows: CmsRecord[]): void {
    for (const selector of ['#selectService', '#modalService']) {
      const select = this.document.querySelector(selector);
      if (!(select instanceof HTMLSelectElement)) continue;
      const options = this.document.createDocumentFragment();
      if (selector === '#selectService') {
        const prompt = this.document.createElement('option');
        prompt.value = '';
        prompt.textContent = '-- Choose Advisory Practice --';
        options.append(prompt);
      }
      rows.forEach(row => {
        const option = this.document.createElement('option');
        option.value = this.text(row, 'title');
        option.textContent = this.text(row, 'title');
        options.append(option);
      });
      const additional = this.document.createElement('option');
      additional.value = selector === '#selectService' ? 'General Enquiry' : 'Integrated Multi-Practice';
      additional.textContent = additional.value;
      options.append(additional);
      select.replaceChildren(options);
    }
  }

  private hydrateProcess(rows: CmsRecord[]): void {
    const timeline = this.document.querySelector('#processTimeline');
    const template = timeline?.querySelector('.process-step');
    if (!timeline || !template) return;
    timeline.querySelectorAll('.process-step').forEach(step => step.remove());
    const fragment = this.document.createDocumentFragment();
    rows.forEach((row, index) => {
      const cloned = template.cloneNode(true);
      if (!(cloned instanceof HTMLElement)) return;
      const step = cloned;
      this.setText(step.querySelector('.process-node'), String(index + 1).padStart(2, '0'));
      this.setText(step.querySelector('h3'), this.text(row, 'title'));
      this.setText(step.querySelector('p'), this.text(row, 'description'));
      step.classList.remove('reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3');
      if (index > 0) step.classList.add(`reveal-delay-${Math.min(index, 3)}`);
      fragment.append(step);
    });
    timeline.append(fragment);
  }

  private hydrateCases(rows: CmsRecord[]): void {
    this.replaceCards('#casesGrid', '.case-card', rows, (card, row, index) => {
      const category = this.text(row, 'category');
      const title = this.text(row, 'title');
      card.setAttribute('data-case-category', category);
      this.setText(card.querySelector('.case-industry'), this.text(row, 'industry'));
      this.setText(card.querySelector('h3'), title);
      this.setText(card.querySelector('.case-snippet'), this.text(row, 'description'));
      this.setImage(card.querySelector('.case-visual img'), row);
      const metrics = this.recordArray(row['metrics']);
      card.querySelectorAll('.case-stat').forEach((metric, metricIndex) => {
        const value = metrics[metricIndex];
        if (!value) {
          metric.remove();
          return;
        }
        this.setText(metric.querySelector('strong'), this.text(value, 'value'));
        this.setText(metric.querySelector('span'), this.text(value, 'label'));
      });
      const button = card.querySelector('[data-open-case]');
      if (button) button.setAttribute('data-open-case', String(index));
      card.setAttribute('aria-label', title);
    });
    this.hydrateCategoryFilters('#cases .filter-bar', rows, 'data-case-filter');
  }

  private hydrateTeam(rows: CmsRecord[]): void {
    this.replaceCards('#teamTrack', '.team-slide-card', rows, (card, row, index) => {
      const name = this.text(row, 'name');
      this.setText(card.querySelector('.team-role-pill'), this.text(row, 'role'));
      this.setText(card.querySelector('.team-name'), name);
      this.setImage(card.querySelector('.team-card-img'), row, name);
      card.setAttribute('data-slide-index', String(index));
      card.setAttribute('aria-label', `${name} - ${this.text(row, 'role')}`);
      const connect = card.querySelector('.team-card-badge-btn');
      const href = this.safeHref(this.text(row, 'linkedin_url')) || '#contact';
      if (connect) this.renderer.setAttribute(connect, 'href', href);
    });
  }

  private hydrateTestimonials(rows: CmsRecord[]): void {
    this.replaceCards('#testimonialTrack', '.testimonial-slide', rows, (slide, row) => {
      this.setText(slide.querySelector('.testimonial-quote'), `“${this.text(row, 'quote')}”`);
      this.setText(slide.querySelector('.author-avatar'), this.text(row, 'avatar_initials'));
      this.setText(slide.querySelector('.testimonial-author h4'), this.text(row, 'author'));
      this.setText(slide.querySelector('.author-meta span'), `${this.text(row, 'role')}, ${this.text(row, 'company')}`);
      this.setText(slide.querySelector('.author-industry'), this.text(row, 'industry'));
      const rating = this.number(row, 'rating', 5);
      slide.querySelectorAll('.testimonial-stars svg').forEach((star, index) => {
        this.renderer.setAttribute(star, 'aria-hidden', index >= rating ? 'true' : 'false');
        this.renderer.setStyle(star, 'display', index >= rating ? 'none' : 'block');
      });
    });
  }

  private hydrateArticles(rows: CmsRecord[]): void {
    this.replaceCards('#articlesGrid', '.article-card', rows, (card, row, index) => {
      const title = this.text(row, 'title');
      this.setText(card.querySelector('.article-cat'), this.text(row, 'category'));
      this.setText(card.querySelector('.article-date'), `${this.formatDate(this.text(row, 'published_at'))} • ${this.number(row, 'read_time', 5)} Min Read`);
      this.setText(card.querySelector('h3'), title);
      this.setText(card.querySelector('.article-body > p'), this.text(row, 'excerpt'));
      this.setImage(card.querySelector('.article-thumb img'), row);
      card.setAttribute('data-article-cat', this.categorySlug(this.text(row, 'category')));
      const button = card.querySelector('[data-open-article]');
      if (button) button.setAttribute('data-open-article', String(index));
    });
    this.hydrateCategoryFilters('#insights .filter-bar', rows, 'data-article-filter');
  }

  private hydrateFaqs(rows: CmsRecord[]): void {
    this.replaceCards('#faqAccordion', '.faq-item', rows, (item, row, index) => {
      this.setText(item.querySelector('.faq-num'), String(index + 1).padStart(2, '0'));
      this.setText(item.querySelector('.faq-q-text'), this.text(row, 'question'));
      this.setText(item.querySelector('.faq-answer-inner'), this.text(row, 'answer'));
      item.classList.toggle('open', index === 0);
      const button = item.querySelector('.faq-question');
      if (button) button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    });
  }

  private hydrateLegalPages(rows: CmsRecord[]): void {
    const legalPages = new Map(rows.map(row => [this.text(row, 'slug'), row]));
    const privacy = legalPages.get('privacy');
    const terms = legalPages.get('terms');
    if (!privacy && !terms) return;
    this.document.querySelectorAll<HTMLButtonElement>('[data-open-legal]').forEach(button => {
      const key = button.getAttribute('data-open-legal') ?? '';
      const row = legalPages.get(key);
      if (row) {
        button.dataset['legalTitle'] = this.text(row, 'title');
        button.dataset['legalBody'] = this.text(row, 'body');
      }
    });
  }

  private replaceCards(
    containerSelector: string,
    cardSelector: string,
    rows: CmsRecord[],
    update: (card: HTMLElement, row: CmsRecord, index: number) => void
  ): void {
    const container = this.document.querySelector(containerSelector);
    if (container && !rows.length) {
      container.querySelectorAll(cardSelector).forEach(card => card.remove());
      return;
    }
    const template = container?.querySelector(cardSelector);
    if (!container || !template) return;
    const fragment = this.document.createDocumentFragment();
    rows.forEach((row, index) => {
      const cloned = template.cloneNode(true);
      if (!(cloned instanceof HTMLElement)) return;
      update(cloned, row, index);
      fragment.append(cloned);
    });
    container.replaceChildren(fragment);
  }

  private replaceTextList(list: Element, values: string[]): void {
    const fragment = this.document.createDocumentFragment();
    values.forEach(value => {
      const item = this.document.createElement('li');
      item.textContent = value;
      fragment.append(item);
    });
    list.replaceChildren(fragment);
  }

  private setImage(element: Element | null, row: CmsRecord, alt?: string): void {
    if (!element) return;
    const image = this.safeImageUrl(this.text(row, 'image_url'));
    if (image) this.renderer.setAttribute(element, 'src', image);
    if (alt !== undefined) this.renderer.setAttribute(element, 'alt', alt);
  }

  private hydrateCategoryFilters(selector: string, rows: CmsRecord[], attribute: string): void {
    const container = this.document.querySelector(selector);
    const template = container?.querySelector('button');
    if (!container || !template) return;
    const categories = Array.from(new Set(rows.map(row => this.text(row, 'category')).filter(Boolean)));
    if (!categories.length) return;
    const fragment = this.document.createDocumentFragment();
    const allButton = template.cloneNode(true);
    if (allButton instanceof HTMLButtonElement) {
      allButton.textContent = attribute === 'data-article-filter' ? 'All Insights' : 'All Case Studies';
      allButton.classList.add('active');
      allButton.setAttribute(attribute, 'all');
      fragment.append(allButton);
    }
    categories.forEach(category => {
      const button = template.cloneNode(true);
      if (!(button instanceof HTMLButtonElement)) return;
      button.textContent = this.categoryLabel(category);
      button.classList.remove('active');
      button.setAttribute(attribute, this.categorySlug(category));
      fragment.append(button);
    });
    container.replaceChildren(fragment);
  }

  private setText(element: Element | null, value: string): void {
    if (element) this.renderer.setProperty(element, 'textContent', value);
  }

  private createElement(tag: string, className: string): HTMLElement {
    const element = this.document.createElement(tag);
    element.className = className;
    return element;
  }

  private appendText(parent: Element, tag: string, className: string, text: string): HTMLElement {
    const element = this.createElement(tag, className);
    element.textContent = text;
    parent.append(element);
    return element;
  }

  private safeImageUrl(value: string): string {
    if (/^\/images\/[a-z0-9._/-]+$/i.test(value) && !value.includes('..')) return value;
    if (/^https:\/\/[^\s]+$/i.test(value)) return value;
    return '';
  }

  private safeHref(value: string): string {
    if (/^#[a-z0-9_-]+$/i.test(value) || /^https:\/\/[^\s]+$/i.test(value) || /^mailto:[^\s]+$/i.test(value)) {
      return value;
    }
    return '';
  }

  private text(row: CmsRecord, key: string): string {
    const value = row[key];
    return typeof value === 'string' ? value : '';
  }

  private number(row: CmsRecord, key: string, fallback: number): number {
    const value = row[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private formatDate(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(date);
  }

  private categorySlug(value: string): string {
    const normalized = value.toLowerCase();
    if (normalized.includes('business strategy')) return 'strategy';
    if (normalized.includes('corporate legal') || normalized.includes('legal')) return 'legal';
    if (normalized.includes('human resource') || normalized.includes('hr')) return 'hr';
    if (normalized.includes('leadership')) return 'leadership';
    return normalized.trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private categoryLabel(value: string): string {
    const labels: Record<string, string> = {
      business: 'Business Consulting',
      legal: 'Legal Services',
      hr: 'HR Consulting',
      strategy: 'Business Strategy & Growth',
      leadership: 'Leadership & Org Development'
    };
    return labels[this.categorySlug(value)] ?? value;
  }

  private record(value: unknown): CmsRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as CmsRecord
      : {};
  }

  private recordArray(value: unknown): CmsRecord[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is CmsRecord =>
      typeof item === 'object' && item !== null && !Array.isArray(item)
    );
  }

  private stringGroups(value: unknown): string[][] {
    if (!Array.isArray(value)) return [];
    return value.map(group => Array.isArray(group)
      ? group.filter((item): item is string => typeof item === 'string')
      : []);
  }
}
