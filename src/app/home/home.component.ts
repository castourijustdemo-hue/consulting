import { AfterViewInit, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicSiteContent, SiteContentService } from './site-content.service';

declare global {
  interface Window {
    initializeLegacyInteractions?: () => void;
    siteCmsContent?: PublicSiteContent;
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit {
  private readonly siteContent = inject(SiteContentService);

  ngAfterViewInit(): void {
    this.siteContent.load().subscribe({
      next: content => {
        window.siteCmsContent = content;
        try {
          this.siteContent.hydrate(content);
        } catch (error) {
          console.error('Could not render the latest website content.', error);
        }
        window.initializeLegacyInteractions?.();
      },
      error: (error: unknown) => {
        const detail = error instanceof HttpErrorResponse ? error.message : error;
        console.error('Could not load website content; showing the original index.html content.', detail);
        window.initializeLegacyInteractions?.();
      }
    });
  }
}
