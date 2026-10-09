import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/pms.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (authService.hasRole(allowedRoles)) {
    return true;
  }

  // Si el usuario es de Limpieza y no tiene permiso para esta ruta, redirigir a housekeeping
  if (authService.userRole() === 'LIMPIEZA') {
    return router.createUrlTree(['/housekeeping']);
  }

  // Por defecto redirigir a rack
  return router.createUrlTree(['/rack']);
};
