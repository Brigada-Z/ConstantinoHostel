import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card animate-slide-up">
        <div class="login-header">
          <div class="logo-box">
            <img src="assets/logo.png" alt="Logo Hostel Constantino" class="login-logo-img" />
          </div>
          <div class="brand-badge">SISTEMA PMS • BRIGADA Z</div>
          <h1 class="brand-title">Hostel Constantino</h1>
          <p class="brand-subtitle">Portal de Operaciones, Rack & Gestión Hotelera</p>
        </div>

        @if (errorMessage()) {
          <div class="alert-error">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="username">Usuario</label>
            <input
              id="username"
              type="text"
              class="form-control"
              [(ngModel)]="username"
              name="username"
              required
              placeholder="Ej: victor, recepcion"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-submit"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span>Accediendo al PMS...</span>
            } @else {
              <span>Ingresar al Sistema</span>
            }
          </button>
        </form>

        <div class="demo-section">
          <p class="demo-title">Perfiles de Demostración Rápida (RBAC):</p>
          <div class="demo-buttons">
            <button
              type="button"
              class="demo-btn"
              (click)="fastLogin('victor', 'admin123')"
            >
              <div class="role-icon-box gold">
                <!-- Monochromatic Crown SVG -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/>
                </svg>
              </div>
              <div class="role-info">
                <strong>Víctor (Administrador)</strong>
                <small>Acceso Global, Tarifas & Auditoría</small>
              </div>
            </button>

            <button
              type="button"
              class="demo-btn"
              (click)="fastLogin('recepcion', 'recepcion123')"
            >
              <div class="role-icon-box info">
                <!-- Monochromatic Concierge Bell SVG -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div class="role-info">
                <strong>Camila (Recepción)</strong>
                <small>Rack, Reservas & Huéspedes</small>
              </div>
            </button>

            <button
              type="button"
              class="demo-btn"
              (click)="fastLogin('limpieza', 'limpieza123')"
            >
              <div class="role-icon-box warn">
                <!-- Monochromatic Housekeeping SVG -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                </svg>
              </div>
              <div class="role-info">
                <strong>Marta (Limpieza)</strong>
                <small>Operatividad Móvil de Campo</small>
              </div>
            </button>
          </div>
        </div>

        <div class="login-footer">
          <a routerLink="/" class="link-back-web">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Volver a la Landing & Catálogo</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 25%, #181920 0%, #060608 100%);
      padding: 1.5rem;
      position: relative;
    }

    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-xl);
      padding: 2.75rem 2.5rem;
      width: 100%;
      max-width: 460px;
      box-shadow: var(--shadow-xl), 0 0 40px rgba(0, 0, 0, 0.9);
      position: relative;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo-box {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--gold-border);
      box-shadow: 0 0 25px rgba(212, 191, 142, 0.2);
      margin-bottom: 1.25rem;
      background: #000;
    }

    .login-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-badge {
      display: inline-block;
      background: rgba(212, 191, 142, 0.1);
      border: 1px solid var(--gold-border);
      color: var(--gold-accent);
      font-family: var(--font-heading);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      margin-bottom: 0.75rem;
    }

    .brand-title {
      font-size: 2rem;
      margin: 0;
      letter-spacing: 0.04em;
    }

    .brand-subtitle {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 0.35rem;
    }

    .alert-error {
      background: var(--danger-bg);
      border: 1px solid var(--danger-border);
      color: var(--danger);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .btn-submit {
      width: 100%;
      padding: 0.85rem;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }

    .demo-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-subtle);
    }

    .demo-title {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.85rem;
      text-align: center;
    }

    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .demo-btn {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
      color: var(--text-main);
    }

    .demo-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--gold-border);
      transform: translateX(2px);
    }

    .role-icon-box {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .role-icon-box.gold {
      background: rgba(212, 191, 142, 0.15);
      color: var(--gold-accent);
    }

    .role-icon-box.info {
      background: var(--info-bg);
      color: var(--info);
    }

    .role-icon-box.warn {
      background: var(--warning-bg);
      color: var(--warning);
    }

    .role-info {
      display: flex;
      flex-direction: column;
    }

    .role-info strong {
      font-size: 0.85rem;
      color: var(--text-main);
    }

    .role-info small {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
    }

    .link-back-web {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: var(--font-heading);
      font-size: 0.78rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--gold-accent);
      transition: color var(--transition-fast);
    }

    .link-back-web:hover {
      color: var(--gold-light);
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor ingresa usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.user.role === 'LIMPIEZA') {
          this.router.navigate(['/housekeeping']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas. Verifica usuario o contraseña.');
        } else {
          this.errorMessage.set('Error al conectar con el servidor backend.');
        }
      }
    });
  }

  fastLogin(user: string, pass: string): void {
    this.username = user;
    this.password = pass;
    this.onSubmit();
  }
}
