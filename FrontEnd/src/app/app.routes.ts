import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECEPCION'] }
      },
      {
        path: 'rack',
        loadComponent: () => import('./features/rack/rack.component').then(m => m.RackComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECEPCION'] }
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/reservations/reservations.component').then(m => m.ReservationsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECEPCION'] }
      },
      {
        path: 'guests',
        loadComponent: () => import('./features/guests/guests.component').then(m => m.GuestsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECEPCION'] }
      },
      {
        path: 'housekeeping',
        loadComponent: () => import('./features/housekeeping/housekeeping.component').then(m => m.HousekeepingComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECEPCION', 'LIMPIEZA'] }
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/audit/audit-logs.component').then(m => m.AuditLogsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
