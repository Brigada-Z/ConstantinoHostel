from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from pms.views import (
    CustomLoginView, CurrentUserView, RoomViewSet, BedViewSet,
    GuestViewSet, ReservationViewSet, OccupancyRackView,
    HousekeepingView, MaintenanceBlockViewSet, AuditLogViewSet,
    DashboardStatsView
)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'beds', BedViewSet, basename='bed')
router.register(r'guests', GuestViewSet, basename='guest')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'maintenance', MaintenanceBlockViewSet, basename='maintenance')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    # Autenticación y Perfil
    path('auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),

    # Rack de Ocupación en Matriz
    path('rack/', OccupancyRackView.as_view(), name='occupancy_rack'),

    # Operatividad Móvil de Limpieza
    path('housekeeping/', HousekeepingView.as_view(), name='housekeeping_ops'),

    # Dashboard y Métricas
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),

    # Recursos del Router
    path('', include(router.urls)),
]
