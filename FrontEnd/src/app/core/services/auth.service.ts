import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, UserRole } from '../models/pms.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api';
  private readonly TOKEN_KEY = 'hc_access_token';
  private readonly USER_KEY = 'hc_current_user';

  private userSignal = signal<User | null>(this.getStoredUser());

  currentUser = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.userSignal() && !!this.getToken());
  userRole = computed(() => this.userSignal()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login/`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.access);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.userSignal.set(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const role = this.userRole();
    if (!role) return false;
    if (this.currentUser()?.is_superuser) return true;
    return allowedRoles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole(['ADMIN']);
  }

  isReception(): boolean {
    return this.hasRole(['ADMIN', 'RECEPCION']);
  }

  isHousekeeping(): boolean {
    return this.hasRole(['ADMIN', 'RECEPCION', 'LIMPIEZA']);
  }
}
