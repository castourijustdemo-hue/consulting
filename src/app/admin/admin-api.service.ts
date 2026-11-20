import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, switchMap, throwError, tap, timeout } from 'rxjs';

export type AdminRow = Record<string, unknown> & { id: string };

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly accessTokenKey = 'vs-admin-access';
  private readonly refreshTokenKey = 'vs-admin-refresh';

  get accessToken(): string {
    return sessionStorage.getItem(this.accessTokenKey) ?? '';
  }

  private get refreshToken(): string {
    return sessionStorage.getItem(this.refreshTokenKey) ?? '';
  }

  login(email: string, password: string): Observable<AuthSession> {
    return this.http.post<AuthSession>('/api/auth', { action: 'login', email, password }).pipe(
      timeout({ first: 15000 }),
      tap(session => this.storeSession(session))
    );
  }

  restoreSession(): Observable<{ id: string; email: string } | null> {
    if (!this.accessToken && !this.refreshToken) return of(null);
    return this.verifySession().pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401 || !this.refreshToken) {
          this.clearSession();
          return error.status === 401 ? of(null) : throwError(() => error);
        }
        return this.refresh().pipe(
          switchMap(() => this.verifySession()),
          catchError((refreshError: unknown) => {
            this.clearSession();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }

  logout(): Observable<void> {
    if (!this.accessToken) {
      this.clearSession();
      return of(undefined);
    }
    return this.http.post<void>(
      '/api/auth',
      { action: 'logout' },
      { headers: this.authorizationHeaders() }
    ).pipe(finalize(() => this.clearSession()));
  }

  authorizationHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.accessToken}` });
  }

  refreshForRequest(): Observable<AuthSession> {
    return this.refresh().pipe(
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  private verifySession(): Observable<{ id: string; email: string }> {
    return this.http.get<{ id: string; email: string }>('/api/auth', {
      headers: this.authorizationHeaders()
    });
  }

  private refresh(): Observable<AuthSession> {
    return this.http.post<AuthSession>('/api/auth', {
      action: 'refresh',
      refreshToken: this.refreshToken
    }).pipe(tap(session => this.storeSession(session)));
  }

  private storeSession(session: AuthSession): void {
    sessionStorage.setItem(this.accessTokenKey, session.accessToken);
    sessionStorage.setItem(this.refreshTokenKey, session.refreshToken);
  }

  private clearSession(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);

  list(resource: string): Observable<AdminRow[]> {
    return this.authorized(() => this.http.get<{ rows: AdminRow[] }>(
      `/api/admin/${encodeURIComponent(resource)}`,
      { headers: this.auth.authorizationHeaders() }
    )).pipe(map(response => response.rows));
  }

  save(resource: string, values: Record<string, unknown>, id?: string): Observable<AdminRow> {
    return this.authorized(() => id
      ? this.http.patch<{ row: AdminRow }>(
        `/api/admin/${encodeURIComponent(resource)}`,
        { ...values, id },
        { headers: this.auth.authorizationHeaders() }
      )
      : this.http.post<{ row: AdminRow }>(
        `/api/admin/${encodeURIComponent(resource)}`,
        values,
        { headers: this.auth.authorizationHeaders() }
      )).pipe(map(response => response.row));
  }

  delete(resource: string, id: string): Observable<void> {
    return this.authorized(() => this.http.delete<void>(
      `/api/admin/${encodeURIComponent(resource)}`,
      {
        headers: this.auth.authorizationHeaders(),
        params: { id }
      }
    ));
  }

  private authorized<T>(request: () => Observable<T>): Observable<T> {
    return request().pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) return throwError(() => error);
        return this.auth.refreshForRequest().pipe(switchMap(() => request()));
      })
    );
  }
}
