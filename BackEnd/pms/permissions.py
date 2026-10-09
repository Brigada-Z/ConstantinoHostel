from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """Acceso exclusivo para el Administrador / Gerente General (Víctor)."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )


class IsReceptionOrAdmin(permissions.BasePermission):
    """Acceso para Recepción y Administrador (Gestión de reservas, huéspedes, rack)."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in ['ADMIN', 'RECEPCION'] or request.user.is_superuser)
        )


class IsHousekeepingOrAbove(permissions.BasePermission):
    """Acceso para personal de limpieza, recepción y administrador."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class HousekeepingRestrictedAccess(permissions.BasePermission):
    """
    Si el usuario tiene rol LIMPIEZA, solo puede acceder a endpoints operativos de limpieza
    y no a datos financieros o filiatorios de huéspedes.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'LIMPIEZA':
            # Solo métodos de lectura o actualización de estado físico
            return request.method in ['GET', 'PATCH', 'POST']
        return True
