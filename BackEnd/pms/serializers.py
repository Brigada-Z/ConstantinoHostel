import uuid
from datetime import date
from django.db import transaction
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from pms.models import (
    User, Room, Bed, Guest, Reservation, MaintenanceBlock, AuditLog,
    ReservationStatus, PhysicalStatus, AuditAction
)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Retorna información del usuario y su rol en la respuesta de login."""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'email': self.user.email,
            'role': self.user.role,
            'is_superuser': self.user.is_superuser
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone']
        read_only_fields = ['id']


class BedSerializer(serializers.ModelSerializer):
    bed_type_display = serializers.CharField(source='get_bed_type_display', read_only=True)
    physical_status_display = serializers.CharField(source='get_physical_status_display', read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Bed
        fields = [
            'id', 'room', 'number', 'bed_type', 'bed_type_display',
            'physical_status', 'physical_status_display', 'is_active',
            'price_per_night', 'effective_price', 'notes', 'last_status_change'
        ]


class RoomSerializer(serializers.ModelSerializer):
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    physical_status_display = serializers.CharField(source='get_physical_status_display', read_only=True)
    beds = BedSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'number', 'name', 'room_type', 'room_type_display',
            'capacity', 'floor', 'base_price_per_night', 'physical_status',
            'physical_status_display', 'notes', 'last_status_change', 'beds'
        ]


class GuestSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        model = Guest
        fields = [
            'id', 'first_name', 'last_name', 'full_name',
            'document_type', 'document_type_display', 'document_number',
            'email', 'phone', 'nationality', 'notes', 'created_at'
        ]

    def validate_document_number(self, value):
        val = value.strip().replace('.', '').replace('-', '')
        if not val:
            raise serializers.ValidationError("El número de documento no puede estar vacío.")
        return val


class MaintenanceBlockSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.number', read_only=True)
    bed_name = serializers.CharField(source='bed.__str__', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = MaintenanceBlock
        fields = [
            'id', 'room', 'bed', 'room_number', 'bed_name',
            'start_date', 'end_date', 'reason', 'created_by',
            'created_by_name', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        room = attrs.get('room')
        bed = attrs.get('bed')

        if not room and not bed:
            raise serializers.ValidationError("Debe indicar una habitación o una cama a bloquear.")

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("La fecha de inicio no puede ser posterior a la de fin.")

        return attrs


class ReservationListSerializer(serializers.ModelSerializer):
    guest = GuestSerializer(read_only=True)
    room_number = serializers.CharField(source='room.number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    beds_detail = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'code', 'guest', 'room', 'room_number', 'beds_detail',
            'check_in_date', 'check_out_date', 'status', 'status_display',
            'total_amount', 'deposit_paid', 'notes', 'created_at'
        ]

    def get_beds_detail(self, obj):
        return [{'id': b.id, 'number': b.number, 'room_number': b.room.number} for b in obj.beds.all()]


class ReservationCreateUpdateSerializer(serializers.ModelSerializer):
    guest = serializers.PrimaryKeyRelatedField(queryset=Guest.objects.all(), required=False)
    guest_id = serializers.IntegerField(required=False)
    guest_data = GuestSerializer(required=False)
    bed_ids = serializers.ListField(child=serializers.IntegerField(), required=False)

    class Meta:
        model = Reservation
        fields = [
            'id', 'code', 'guest', 'guest_id', 'guest_data', 'room',
            'bed_ids', 'check_in_date', 'check_out_date', 'status',
            'total_amount', 'deposit_paid', 'notes'
        ]
        read_only_fields = ['id', 'code']

    def validate(self, attrs):
        check_in = attrs.get('check_in_date')
        check_out = attrs.get('check_out_date')
        room = attrs.get('room')
        bed_ids = attrs.get('bed_ids', [])
        instance_id = self.instance.id if self.instance else None

        if check_in and check_out:
            if check_in >= check_out:
                raise serializers.ValidationError({
                    'check_out_date': "La fecha de Check-out debe ser posterior al Check-in."
                })

        # Determinar todas las camas involucradas
        resolved_beds = []
        if room and room.room_type in ['DOUBLE_PRIVATE', 'TRIPLE_PRIVATE']:
            # En habitaciones privadas se reservan todas las camas de la unidad
            resolved_beds = list(room.beds.all())
        elif bed_ids:
            resolved_beds = list(Bed.objects.filter(id__in=bed_ids))
        elif self.instance:
            resolved_beds = list(self.instance.beds.all())

        if not resolved_beds:
            raise serializers.ValidationError({
                'bed_ids': "Debe seleccionar al menos una cama o una habitación privada válida."
            })

        # VALIDACIÓN ATÓMICA ANTI-OVERBOOKING
        for bed in resolved_beds:
            # 1. Verificar solapamiento con reservas activas
            conflict_res = Reservation.objects.filter(
                beds=bed,
                status__in=[
                    ReservationStatus.PENDIENTE_SENA,
                    ReservationStatus.CONFIRMADA,
                    ReservationStatus.CHECK_IN
                ],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            )
            if instance_id:
                conflict_res = conflict_res.exclude(id=instance_id)

            if conflict_res.exists():
                c = conflict_res.first()
                raise serializers.ValidationError({
                    'non_field_errors': (
                        f"SUPERPOSICIÓN DETECTADA: La cama '{bed.number}' (Habitación {bed.room.number}) "
                        f"ya se encuentra reservada por {c.guest.full_name()} (Código: {c.code}) "
                        f"desde {c.check_in_date} hasta {c.check_out_date}."
                    )
                })

            # 2. Verificar bloqueo de mantenimiento
            conflict_block = MaintenanceBlock.objects.filter(
                is_active=True,
                start_date__lte=check_out,
                end_date__gte=check_in
            ).filter(
                Q(bed=bed) | Q(room=bed.room, bed__isnull=True)
            )
            if conflict_block.exists():
                b = conflict_block.first()
                target_str = f"Hab {b.room.number}" if b.room else f"Cama {b.bed.number}"
                raise serializers.ValidationError({
                    'non_field_errors': (
                        f"BLOQUEO POR MANTENIMIENTO: {target_str} está fuera de servicio "
                        f"desde {b.start_date} hasta {b.end_date}. Motivo: {b.reason}."
                    )
                })

        attrs['_resolved_beds'] = resolved_beds
        return attrs

    def create(self, validated_data):
        resolved_beds = validated_data.pop('_resolved_beds', [])
        bed_ids = validated_data.pop('bed_ids', [])
        guest_id = validated_data.pop('guest_id', None)
        guest_data = validated_data.pop('guest_data', None)

        # Resolver Huésped
        if guest_id:
            guest = Guest.objects.get(id=guest_id)
        elif guest_data:
            guest, _ = Guest.objects.get_or_create(
                document_number=guest_data['document_number'],
                defaults=guest_data
            )
        else:
            guest = validated_data.get('guest')

        if not guest:
            raise serializers.ValidationError({'guest': "Huésped requerido."})

        validated_data['guest'] = guest

        # Generar código único de reserva (HC-YYYY-XXXX)
        year = date.today().year
        random_suffix = uuid.uuid4().hex[:5].upper()
        validated_data['code'] = f"HC-{year}-{random_suffix}"

        user = self.context['request'].user if 'request' in self.context else None
        if user and user.is_authenticated:
            validated_data['created_by'] = user

        with transaction.atomic():
            # Bloquear filas de camas seleccionadas para control de concurrencia
            list(Bed.objects.select_for_update().filter(id__in=[b.id for b in resolved_beds]))
            
            reservation = Reservation.objects.create(**validated_data)
            reservation.beds.set(resolved_beds)

            # Registrar en Auditoría
            AuditLog.objects.create(
                user=user if user and user.is_authenticated else None,
                action=AuditAction.CREATE,
                entity_type='RESERVATION',
                entity_id=reservation.code,
                description=f"Nueva reserva creada para {guest.full_name()} ({reservation.check_in_date} al {reservation.check_out_date}) con {len(resolved_beds)} plaza(s)."
            )

        return reservation

    def update(self, instance, validated_data):
        resolved_beds = validated_data.pop('_resolved_beds', None)
        validated_data.pop('bed_ids', None)
        validated_data.pop('guest_id', None)
        validated_data.pop('guest_data', None)

        user = self.context['request'].user if 'request' in self.context else None

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if resolved_beds is not None:
                instance.beds.set(resolved_beds)

            AuditLog.objects.create(
                user=user if user and user.is_authenticated else None,
                action=AuditAction.UPDATE,
                entity_type='RESERVATION',
                entity_id=instance.code,
                description=f"Reserva {instance.code} modificada. Estado actual: {instance.get_status_display()}."
            )

        return instance


class HousekeepingBedSerializer(serializers.ModelSerializer):
    physical_status_display = serializers.CharField(source='get_physical_status_display', read_only=True)

    class Meta:
        model = Bed
        fields = ['id', 'number', 'bed_type', 'physical_status', 'physical_status_display', 'notes']


class HousekeepingRoomSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para personal de limpieza.
    NO expone datos personales ni montos financieros de huéspedes.
    """
    physical_status_display = serializers.CharField(source='get_physical_status_display', read_only=True)
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    beds = HousekeepingBedSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'number', 'name', 'floor', 'room_type', 'room_type_display',
            'physical_status', 'physical_status_display', 'notes',
            'last_status_change', 'beds'
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', default='Sistema', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'action', 'action_display',
            'entity_type', 'entity_id', 'description', 'timestamp', 'metadata'
        ]
