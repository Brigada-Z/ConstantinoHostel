from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', _('Administrador / Gerente')
    RECEPCION = 'RECEPCION', _('Recepción')
    LIMPIEZA = 'LIMPIEZA', _('Personal de Limpieza')


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.RECEPCION,
        help_text=_('Rol en el sistema para control de acceso RBAC')
    )
    phone = models.CharField(max_length=50, blank=True)

    def is_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    def is_recepcion(self):
        return self.role == UserRole.RECEPCION or self.is_admin()

    def is_limpieza(self):
        return self.role == UserRole.LIMPIEZA or self.is_admin()

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class PhysicalStatus(models.TextChoices):
    CLEAN = 'CLEAN', _('Limpia')
    DIRTY = 'DIRTY', _('Sucia')
    CLEANING = 'CLEANING', _('En Limpieza')
    MAINTENANCE = 'MAINTENANCE', _('Mantenimiento')


class RoomType(models.TextChoices):
    DOUBLE_PRIVATE = 'DOUBLE_PRIVATE', _('Doble Privada')
    TRIPLE_PRIVATE = 'TRIPLE_PRIVATE', _('Triple')
    SHARED_DORM = 'SHARED_DORM', _('Compartida (6 plazas)')


class Room(models.Model):
    number = models.CharField(max_length=10, unique=True, help_text=_('Número de habitación, ej: 101, 301'))
    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=20, choices=RoomType.choices)
    capacity = models.PositiveIntegerField(help_text=_('Capacidad total de plazas/huéspedes'))
    floor = models.PositiveIntegerField(default=1)
    base_price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    physical_status = models.CharField(
        max_length=20,
        choices=PhysicalStatus.choices,
        default=PhysicalStatus.CLEAN
    )
    notes = models.TextField(blank=True)
    last_status_change = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"Hab {self.number} - {self.name} ({self.get_room_type_display()})"


class BedType(models.TextChoices):
    INDIVIDUAL = 'INDIVIDUAL', _('Individual')
    MATRIMONIAL = 'MATRIMONIAL', _('Matrimonial')
    BUNK_TOP = 'BUNK_TOP', _('Cucheta Alta')
    BUNK_BOTTOM = 'BUNK_BOTTOM', _('Cucheta Baja')


class Bed(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='beds')
    number = models.CharField(max_length=50, help_text=_('Nombre o número de la cama, ej: Cama 1, Cucheta 1-Alta'))
    bed_type = models.CharField(max_length=20, choices=BedType.choices, default=BedType.INDIVIDUAL)
    physical_status = models.CharField(
        max_length=20,
        choices=PhysicalStatus.choices,
        default=PhysicalStatus.CLEAN
    )
    is_active = models.BooleanField(default=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    last_status_change = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['room__number', 'number']
        unique_together = ('room', 'number')

    def effective_price(self):
        if self.price_per_night is not None and self.price_per_night > 0:
            return self.price_per_night
        if self.room.capacity > 0:
            return self.room.base_price_per_night / self.room.capacity
        return self.room.base_price_per_night

    def __str__(self):
        return f"{self.room.number} - {self.number} ({self.get_bed_type_display()})"


class DocumentType(models.TextChoices):
    DNI = 'DNI', _('DNI')
    PASSPORT = 'PASSPORT', _('Pasaporte')
    OTHER = 'OTHER', _('Otro')


class Guest(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.DNI)
    document_number = models.CharField(max_length=50, unique=True)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    nationality = models.CharField(max_length=100, default='Argentina')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def full_name(self):
        return f"{self.last_name}, {self.first_name}"

    def __str__(self):
        return f"{self.full_name()} ({self.document_number})"


class MaintenanceBlock(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True, blank=True, related_name='maintenance_blocks')
    bed = models.ForeignKey(Bed, on_delete=models.CASCADE, null=True, blank=True, related_name='maintenance_blocks')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def clean(self):
        if not self.room and not self.bed:
            raise ValidationError(_('Debe especificar una habitación o una cama para el bloqueo de mantenimiento.'))
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError(_('La fecha de inicio de mantenimiento no puede ser posterior a la fecha de fin.'))

    def __str__(self):
        target = f"Hab {self.room.number}" if self.room else f"Cama {self.bed}"
        return f"Bloqueo {target} ({self.start_date} al {self.end_date})"


class ReservationStatus(models.TextChoices):
    PENDIENTE_SENA = 'PENDIENTE_SENA', _('Pendiente de Seña')
    CONFIRMADA = 'CONFIRMADA', _('Confirmada')
    CHECK_IN = 'CHECK_IN', _('Check-in Realizado')
    CHECK_OUT = 'CHECK_OUT', _('Check-out Realizado')
    CANCELADA = 'CANCELADA', _('Cancelada')


class Reservation(models.Model):
    code = models.CharField(max_length=30, unique=True)
    guest = models.ForeignKey(Guest, on_delete=models.PROTECT, related_name='reservations')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations')
    beds = models.ManyToManyField(Bed, related_name='reservations')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=ReservationStatus.choices,
        default=ReservationStatus.PENDIENTE_SENA
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deposit_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_reservations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-check_in_date', '-created_at']

    def clean(self):
        if self.check_in_date and self.check_out_date and self.check_in_date >= self.check_out_date:
            raise ValidationError(_('La fecha de Check-out debe ser posterior a la fecha de Check-in.'))

    def __str__(self):
        return f"Reserva {self.code} - {self.guest.full_name()} ({self.get_status_display()})"


class AuditAction(models.TextChoices):
    CREATE = 'CREATE', _('Alta / Creación')
    UPDATE = 'UPDATE', _('Modificación')
    CANCEL = 'CANCEL', _('Cancelación')
    STATUS_CHANGE = 'STATUS_CHANGE', _('Cambio de Estado Físico')
    CHECK_IN = 'CHECK_IN', _('Check-in')
    CHECK_OUT = 'CHECK_OUT', _('Check-out')
    MAINTENANCE = 'MAINTENANCE', _('Mantenimiento')
    AUTH = 'AUTH', _('Autenticación / Seguridad')


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=AuditAction.choices)
    entity_type = models.CharField(max_length=50) # 'RESERVATION', 'ROOM', 'BED', 'GUEST', 'MAINTENANCE'
    entity_id = models.CharField(max_length=50, blank=True)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        username = self.user.username if self.user else 'Sistema'
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {username} - {self.action} on {self.entity_type} #{self.entity_id}"
