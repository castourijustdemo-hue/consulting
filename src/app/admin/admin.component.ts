import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TimeoutError } from 'rxjs';
import { AdminApiService, AdminAuthService, AdminRow } from './admin-api.service';
import { AdminField, RESOURCE_DEFINITIONS, ResourceDefinition } from './resource-definitions';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly auth = inject(AdminAuthService);
  private readonly api = inject(AdminApiService);

  readonly resources = RESOURCE_DEFINITIONS;
  email = '';
  password = '';
  adminEmail = '';
  loginPending = false;
  sessionChecked = false;
  authenticated = false;
  loadingRows = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  selectedResource = RESOURCE_DEFINITIONS[0];
  rows: AdminRow[] = [];
  editorOpen = false;
  editingId = '';
  formValues: Record<string, unknown> = {};

  ngOnInit(): void {
    this.auth.restoreSession().subscribe({
      next: admin => {
        this.sessionChecked = true;
        if (admin) {
          this.authenticated = true;
          this.adminEmail = admin.email;
          this.loadRows();
        }
        this.refreshView();
      },
      error: error => {
        this.sessionChecked = true;
        this.errorMessage = this.errorText(error);
        this.refreshView();
      }
    });
  }

  login(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loginPending = true;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.auth.restoreSession().subscribe({
          next: admin => {
            this.loginPending = false;
            if (!admin) {
              this.errorMessage = 'Could not verify administrator access.';
              this.refreshView();
              return;
            }
            this.authenticated = true;
            this.adminEmail = admin.email;
            this.refreshView();
            this.loadRows();
          },
          error: error => {
            this.loginPending = false;
            this.errorMessage = this.errorText(error);
            this.refreshView();
          }
        });
      },
      error: error => {
        this.loginPending = false;
        this.errorMessage = this.errorText(error);
        this.refreshView();
      }
    });
  }

  logout(): void {
    this.errorMessage = '';
    this.auth.logout().subscribe({
      next: () => {
        this.resetSession();
        this.refreshView();
      },
      error: error => {
        this.errorMessage = this.errorText(error);
        this.resetSession();
        this.refreshView();
      }
    });
  }

  selectResource(resource: ResourceDefinition): void {
    this.selectedResource = resource;
    this.searchTerm = '';
    this.closeEditor();
    this.loadRows();
  }

  loadRows(): void {
    this.loadingRows = true;
    this.errorMessage = '';
    this.api.list(this.selectedResource.key).subscribe({
      next: rows => {
        this.rows = rows;
        this.loadingRows = false;
        this.refreshView();
      },
      error: error => {
        this.errorMessage = this.errorText(error);
        this.loadingRows = false;
        this.refreshView();
      }
    });
  }

  filteredRows(): AdminRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) return this.rows;
    return this.rows.filter(row =>
      this.selectedResource.columns.some(column =>
        this.displayValue(row[column]).toLowerCase().includes(query)
      )
    );
  }

  createRecord(): void {
    this.editingId = '';
    this.formValues = {};
    for (const field of this.selectedResource.fields) {
      if (field.type === 'checkbox') this.formValues[field.key] = true;
      else if (field.type === 'number') this.formValues[field.key] = field.key === 'sort_order' ? this.nextSortOrder() : '';
      else if (field.type === 'json') this.formValues[field.key] = field.key === 'metadata' || field.key === 'details' ? '{}' : '[]';
      else if (field.key === 'status') this.formValues[field.key] = 'new';
      else if (field.type === 'date') this.formValues[field.key] = new Date().toISOString().slice(0, 10);
      else this.formValues[field.key] = '';
    }
    this.errorMessage = '';
    this.editorOpen = true;
  }

  editRecord(row: AdminRow): void {
    this.editingId = row.id;
    this.formValues = {};
    for (const field of this.selectedResource.fields) {
      const value = row[field.key];
      this.formValues[field.key] = field.type === 'json'
        ? JSON.stringify(value ?? (field.key === 'metadata' || field.key === 'details' ? {} : []), null, 2)
        : value ?? (field.type === 'checkbox' ? false : '');
    }
    this.errorMessage = '';
    this.editorOpen = true;
  }

  formValue(field: AdminField): string | number | boolean {
    const value = this.formValues[field.key];
    if (field.type === 'checkbox') return value === true;
    if (field.type === 'json') return typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);
    if (typeof value === 'number') return value;
    return typeof value === 'string' ? value : '';
  }

  updateField(key: string, value: string): void {
    this.formValues[key] = value;
  }

  updateTextField(key: string, event: Event): void {
    const target = event.currentTarget;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      this.formValues[key] = target.value;
    }
  }

  updateCheckbox(key: string, event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) this.formValues[key] = input.checked;
  }

  saveRecord(): void {
    this.errorMessage = '';
    const values: Record<string, unknown> = {};
    try {
      for (const field of this.selectedResource.fields) {
        const value = this.formValues[field.key];
        if (field.required && (typeof value !== 'string' || !value.trim())) {
          throw new Error(`${field.label} is required.`);
        }
        if (field.type === 'json') {
          const serialized = typeof value === 'string' ? value.trim() : '';
          values[field.key] = serialized ? JSON.parse(serialized) : (field.key === 'metadata' || field.key === 'details' ? {} : []);
        } else if (field.type === 'number') {
          if (value === '' || value === undefined || value === null) continue;
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue)) throw new Error(`${field.label} must be a number.`);
          values[field.key] = numericValue;
        } else {
          values[field.key] = value ?? '';
        }
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Check the form values and try again.';
      return;
    }

    this.saving = true;
    this.api.save(this.selectedResource.key, values, this.editingId || undefined).subscribe({
      next: () => {
        this.saving = false;
        this.editorOpen = false;
        this.successMessage = `${this.selectedResource.singular} saved.`;
        this.refreshView();
        this.loadRows();
      },
      error: error => {
        this.saving = false;
        this.errorMessage = this.errorText(error);
        this.refreshView();
      }
    });
  }

  deleteRecord(row: AdminRow): void {
    if (!window.confirm(`Permanently delete this ${this.selectedResource.singular.toLowerCase()}?`)) return;
    this.errorMessage = '';
    this.api.delete(this.selectedResource.key, row.id).subscribe({
      next: () => {
        this.successMessage = `${this.selectedResource.singular} deleted.`;
        this.refreshView();
        this.loadRows();
      },
      error: error => {
        this.errorMessage = this.errorText(error);
        this.refreshView();
      }
    });
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editingId = '';
    this.formValues = {};
  }

  displayValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return text.length > 100 ? `${text.slice(0, 97)}…` : text;
  }

  trackById(_index: number, row: AdminRow): string {
    return row.id;
  }

  private nextSortOrder(): number {
    const currentMax = this.rows.reduce((max, row) => {
      const order = row['sort_order'];
      return typeof order === 'number' ? Math.max(max, order) : max;
    }, 0);
    return currentMax + 10;
  }

  private resetSession(): void {
    this.authenticated = false;
    this.adminEmail = '';
    this.password = '';
    this.rows = [];
    this.sessionChecked = true;
  }

  private refreshView(): void {
    this.changeDetector.markForCheck();
  }

  private errorText(error: unknown): string {
    if (error instanceof TimeoutError) {
      return 'The authentication service did not respond. Check your Supabase configuration and run npm run dev:vercel for local login.';
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404 && error.url?.endsWith('/api/auth')) {
        return 'The admin API is not running. Use npm run dev:vercel instead of npm run dev for local login.';
      }
      const response = error.error as { error?: unknown } | null;
      if (response && typeof response.error === 'string') return response.error;
      return error.message || 'The request could not be completed.';
    }
    return error instanceof Error ? error.message : 'The request could not be completed.';
  }
}
