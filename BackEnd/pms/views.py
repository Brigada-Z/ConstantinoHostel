import datetime
from django.db import transaction
from django.db.models import Q, Count
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from pms.models import (
    User, Room, Bed, Guest, Reservation, MaintenanceBlock, AuditLog,
    ReservationStatus, PhysicalStatus, AuditAction, RoomType
)
from pms.serializers import (
    CustomTokenObtainPairSerializer, UserSerializer,
    RoomSerializer, BedSerializer, GuestSerializer,
    ReservationListSerializer, ReservationCreateUpdateSerializer,
    MaintenanceBlockSerializer, HousekeepingRoomSerializer,
    AuditLogSerializer
)
from pms.permissions import (
    IsAdminRole, IsReceptionOrAdmin, IsHousekeepingOrAbove
)


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Room.objects.prefetch_related('beds').all()
    serializer_class = RoomSerializer
    permission_classes = [IsHousekeepingOrAbove]

    @action(detail=True, methods=['patch'], permission_classes=[IsHousekeepingOrAbove])
    def status(self, request, pk=None):
        room = self.get_object()
        new_status = request.data.get('physical_status')
        notes = request.data.get('notes', '')

        if new_status not in dict(PhysicalStatus.choices):
            return Response(
                {'error': f"Estado inválido. Opciones: {list(dict(PhysicalStatus.choices).keys())}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = room.physical_status
        room.physical_status = new_status
        if notes:
            room.notes = notes
        room.save()

        # Si se cambia estado de la habitación completa, actualizar sus camas también si se solicita
        if request.data.get('sync_beds', True):
            room.beds.all().update(physical_status=new_status)

        AuditLog.objects.create(
            user=request.user,
            action=AuditAction.STATUS_CHANGE,
            entity_type='ROOM',
            entity_id=room.number,
            description=f"Estado de Hab {room.number} cambiado de {old_status} a {new_status}. {notes}"
        )

        return Response(RoomSerializer(room).data)


class BedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bed.objects.select_related('room').all()
    serializer_class = BedSerializer
    permission_classes = [IsHousekeepingOrAbove]

    @action(detail=True, methods=['patch'], permission_classes=[IsHousekeepingOrAbove])
    def status(self, request, pk=None):
        bed = self.get_object()
        new_status = request.data.get('physical_status')
        notes = request.data.get('notes', '')

        if new_status not in dict(PhysicalStatus.choices):
            return Response({'error': 'Estado no válido'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = bed.physical_status
        bed.physical_status = new_status
        if notes:
            bed.notes = notes
        bed.save()

        AuditLog.objects.create(
            user=request.user,
            action=AuditAction.STATUS_CHANGE,
            entity_type='BED',
            entity_id=f"{bed.room.number}-{bed.number}",
            description=f"Estado de cama {bed.number} (Hab {bed.room.number}) cambiado de {old_status} a {new_status}."
        )

        return Response(BedSerializer(bed).data)


class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all()
    serializer_class = GuestSerializer
    permission_classes = [IsReceptionOrAdmin]

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])

        guests = Guest.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(document_number__icontains=query) |
            Q(email__icontains=query) |
            Q(phone__icontains=query)
        )[:10]

        return Response(GuestSerializer(guests, many=True).data)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('guest', 'room', 'created_by').prefetch_related('beds', 'beds__room').all()
    permission_classes = [IsReceptionOrAdmin]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReservationCreateUpdateSerializer
        return ReservationListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                Q(code__icontains=q) |
                Q(guest__first_name__icontains=q) |
                Q(guest__last_name__icontains=q) |
                Q(guest__document_number__icontains=q)
            )
        return qs

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancelación trazable. NUNCA se elimina físicamente la reserva.
        """
        reservation = self.get_object()
        reason = request.data.get('reason', 'Sin motivo especificado')

        if reservation.status == ReservationStatus.CANCELADA:
            return Response({'error': 'La reserva ya se encuentra cancelada.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            old_status = reservation.status
            reservation.status = ReservationStatus.CANCELADA
            reservation.notes = f"{reservation.notes}\n[Cancelada el {timezone.now().strftime('%Y-%m-%d %H:%M')}: {reason}]"
            reservation.save()

            AuditLog.objects.create(
                user=request.user,
                action=AuditAction.CANCEL,
                entity_type='RESERVATION',
                entity_id=reservation.code,
                description=f"Reserva {reservation.code} de {reservation.guest.full_name()} cancelada. Motivo: {reason}. Estado previo: {old_status}."
            )

        return Response(ReservationListSerializer(reservation).data)

    @action(detail=True, methods=['patch'])
    def change_status(self, request, pk=None):
        reservation = self.get_object()
        new_status = request.data.get('status')

        if new_status not in dict(ReservationStatus.choices):
            return Response({'error': 'Estado no válido'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = reservation.status
        reservation.status = new_status

        # Si hace check-in, marcar camas y habitación como ocupadas o limpias
        if new_status == ReservationStatus.CHECK_IN:
            action_type = AuditAction.CHECK_IN
        elif new_status == ReservationStatus.CHECK_OUT:
            action_type = AuditAction.CHECK_OUT
            # Al hacer check-out, marcar camas/habitación como 'DIRTY' automáticamente para limpieza
            reservation.beds.all().update(physical_status=PhysicalStatus.DIRTY)
            if reservation.room:
                reservation.room.physical_status = PhysicalStatus.DIRTY
                reservation.room.save()
        else:
            action_type = AuditAction.UPDATE

        reservation.save()

        AuditLog.objects.create(
            user=request.user,
            action=action_type,
            entity_type='RESERVATION',
            entity_id=reservation.code,
            description=f"Reserva {reservation.code} cambió de {old_status} a {new_status}."
        )

        return Response(ReservationListSerializer(reservation).data)

    @action(detail=False, methods=['post'])
    def check_availability(self, request):
        """
        Consulta rápida de disponibilidad para un rango de fechas.
        """
        check_in = request.data.get('check_in_date')
        check_out = request.data.get('check_out_date')
        room_id = request.data.get('room_id')
        bed_ids = request.data.get('bed_ids', [])

        if not check_in or not check_out:
            return Response({'error': 'Debe especificar check_in_date y check_out_date.'}, status=status.HTTP_400_BAD_REQUEST)

        target_beds = []
        if room_id:
            room = Room.objects.get(id=room_id)
            if room.room_type in [RoomType.DOUBLE_PRIVATE, RoomType.TRIPLE_PRIVATE]:
                target_beds = list(room.beds.all())
        if bed_ids:
            target_beds = list(Bed.objects.filter(id__in=bed_ids))

        conflicts = []
        for bed in target_beds:
            # Reservas activas
            res_overlap = Reservation.objects.filter(
                beds=bed,
                status__in=[ReservationStatus.PENDIENTE_SENA, ReservationStatus.CONFIRMADA, ReservationStatus.CHECK_IN],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            ).first()
            if res_overlap:
                conflicts.append({
                    'bed_id': bed.id,
                    'bed_number': bed.number,
                    'room_number': bed.room.number,
                    'type': 'RESERVATION',
                    'detail': f"Ocupada por {res_overlap.guest.full_name()} ({res_overlap.check_in_date} al {res_overlap.check_out_date})"
                })

            # Mantenimiento
            block_overlap = MaintenanceBlock.objects.filter(
                is_active=True,
                start_date__lte=check_out,
                end_date__gte=check_in
            ).filter(Q(bed=bed) | Q(room=bed.room, bed__isnull=True)).first()
            if block_overlap:
                conflicts.append({
                    'bed_id': bed.id,
                    'bed_number': bed.number,
                    'room_number': bed.room.number,
                    'type': 'MAINTENANCE',
                    'detail': f"Bloqueo por mantenimiento: {block_overlap.reason}"
                })

        return Response({
            'available': len(conflicts) == 0,
            'conflicts': conflicts
        })


class OccupancyRackView(APIView):
    """
    Calendario reactivo en matriz (Rack) de ocupación.
    Resuelve la matriz completa en tiempo récord (< 50ms).
    """
    permission_classes = [IsReceptionOrAdmin]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        days = int(request.query_params.get('days', 14))
        days = min(max(days, 1), 31) # Entre 1 y 31 días

        if start_date_str:
            try:
                start_date = datetime.date.fromisoformat(start_date_str)
            except ValueError:
                start_date = timezone.localdate()
        else:
            start_date = timezone.localdate()

        end_date = start_date + datetime.timedelta(days=days)
        today = timezone.localdate()

        # Generar lista de fechas
        dates_list = []
        for i in range(days):
            d = start_date + datetime.timedelta(days=i)
            day_names = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
            dates_list.append({
                'date': d.isoformat(),
                'day_name': day_names[d.weekday()],
                'day_short': day_names[d.weekday()][:3],
                'day_number': d.day,
                'month_name': d.strftime('%b'),
                'is_today': d == today,
                'is_weekend': d.weekday() in [5, 6]
            })

        # Cargar todas las habitaciones y camas
        rooms = Room.objects.prefetch_related('beds').all()

        # Cargar reservas activas en el rango
        reservations = Reservation.objects.filter(
            status__in=[
                ReservationStatus.PENDIENTE_SENA,
                ReservationStatus.CONFIRMADA,
                ReservationStatus.CHECK_IN
            ],
            check_in_date__lt=end_date,
            check_out_date__gt=start_date
        ).select_related('guest', 'room').prefetch_related('beds')

        # Cargar bloqueos de mantenimiento en el rango
        blocks = MaintenanceBlock.objects.filter(
            is_active=True,
            start_date__lt=end_date,
            end_date__gt=start_date
        ).select_related('room', 'bed')

        # Mapear reservas y bloqueos para acceso rápido en memoria
        # bed_id -> { date_iso -> reservation_info }
        bed_reservations_map = {}
        for r in reservations:
            for bed in r.beds.all():
                if bed.id not in bed_reservations_map:
                    bed_reservations_map[bed.id] = []
                bed_reservations_map[bed.id].append(r)

        bed_blocks_map = {}
        room_blocks_map = {}
        for b in blocks:
            if b.bed:
                if b.bed.id not in bed_blocks_map:
                    bed_blocks_map[b.bed.id] = []
                bed_blocks_map[b.bed.id].append(b)
            if b.room and not b.bed:
                if b.room.id not in room_blocks_map:
                    room_blocks_map[b.room.id] = []
                room_blocks_map[b.room.id].append(b)

        # Construir matriz
        rack_data = []
        for room in rooms:
            room_dict = {
                'id': room.id,
                'number': room.number,
                'name': room.name,
                'room_type': room.room_type,
                'room_type_display': room.get_room_type_display(),
                'capacity': room.capacity,
                'floor': room.floor,
                'physical_status': room.physical_status,
                'base_price': str(room.base_price_per_night),
                'beds': []
            }

            for bed in room.beds.all():
                bed_cells = []
                bed_res_list = bed_reservations_map.get(bed.id, [])
                bed_blk_list = bed_blocks_map.get(bed.id, [])
                room_blk_list = room_blocks_map.get(room.id, [])

                for day_info in dates_list:
                    d_obj = datetime.date.fromisoformat(day_info['date'])
                    cell_status = 'AVAILABLE'
                    cell_color = '#10B981' # Verde libre
                    cell_label = 'Disponible'
                    res_info = None
                    maint_info = None

                    # 1. Comprobar mantenimiento primero
                    # Bloqueo a nivel cama o habitación
                    active_blk = next((
                        blk for blk in (bed_blk_list + room_blk_list)
                        if blk.start_date <= d_obj < blk.end_date
                    ), None)

                    if active_blk:
                        cell_status = 'MAINTENANCE'
                        cell_color = '#64748B' # Gris pizarra
                        cell_label = 'Mantenimiento'
                        maint_info = {
                            'id': active_blk.id,
                            'reason': active_blk.reason
                        }
                    else:
                        # 2. Comprobar reservas
                        active_res = next((
                            res for res in bed_res_list
                            if res.check_in_date <= d_obj < res.check_out_date
                        ), None)

                        if active_res:
                            if active_res.status == ReservationStatus.CHECK_IN:
                                cell_status = 'CHECK_IN'
                                cell_color = '#8B5CF6' # Púrpura ocupado
                                cell_label = 'Ocupada'
                            elif active_res.status == ReservationStatus.CONFIRMADA:
                                cell_status = 'CONFIRMADA'
                                cell_color = '#2563EB' # Azul confirmada
                                cell_label = 'Confirmada'
                            elif active_res.status == ReservationStatus.PENDIENTE_SENA:
                                cell_status = 'PENDIENTE_SENA'
                                cell_color = '#F59E0B' # Ámbar seña pendiente
                                cell_label = 'Seña Pendiente'

                            res_info = {
                                'id': active_res.id,
                                'code': active_res.code,
                                'guest_name': active_res.guest.full_name(),
                                'guest_phone': active_res.guest.phone,
                                'status': active_res.status,
                                'status_display': active_res.get_status_display(),
                                'check_in': active_res.check_in_date.isoformat(),
                                'check_out': active_res.check_out_date.isoformat(),
                                'is_check_in_day': active_res.check_in_date == d_obj,
                                'is_check_out_day': active_res.check_out_date == d_obj + datetime.timedelta(days=1)
                            }
                        else:
                            # Si no hay reserva ni mantenimiento, reflejar estado físico del día de hoy
                            if day_info['is_today']:
                                if bed.physical_status == PhysicalStatus.DIRTY or room.physical_status == PhysicalStatus.DIRTY:
                                    cell_status = 'DIRTY'
                                    cell_color = '#EF4444' # Rojo sucia
                                    cell_label = 'Sucia'
                                elif bed.physical_status == PhysicalStatus.CLEANING or room.physical_status == PhysicalStatus.CLEANING:
                                    cell_status = 'CLEANING'
                                    cell_color = '#F97316' # Naranja en limpieza
                                    cell_label = 'En Limpieza'

                    bed_cells.append({
                        'date': day_info['date'],
                        'status': cell_status,
                        'color': cell_color,
                        'label': cell_label,
                        'reservation': res_info,
                        'maintenance': maint_info
                    })

                room_dict['beds'].append({
                    'id': bed.id,
                    'number': bed.number,
                    'bed_type': bed.bed_type,
                    'bed_type_display': bed.get_bed_type_display(),
                    'physical_status': bed.physical_status,
                    'price': str(bed.effective_price()),
                    'cells': bed_cells
                })

            rack_data.append(room_dict)

        return Response({
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'days_count': days,
            'dates': dates_list,
            'rooms': rack_data,
            'color_legend': [
                {'status': 'CONFIRMADA', 'label': 'Confirmada', 'color': '#2563EB'},
                {'status': 'PENDIENTE_SENA', 'label': 'Seña Pendiente', 'color': '#F59E0B'},
                {'status': 'CHECK_IN', 'label': 'Ocupada / Check-in', 'color': '#8B5CF6'},
                {'status': 'AVAILABLE', 'label': 'Disponible / Limpia', 'color': '#10B981'},
                {'status': 'DIRTY', 'label': 'Sucia', 'color': '#EF4444'},
                {'status': 'CLEANING', 'label': 'En Limpieza', 'color': '#F97316'},
                {'status': 'MAINTENANCE', 'label': 'Mantenimiento', 'color': '#64748B'}
            ]
        })


class HousekeepingView(APIView):
    """
    Vista minimalista de campo para personal de limpieza (móvil).
    Sin exposición de datos financieros ni personales de huéspedes.
    """
    permission_classes = [IsHousekeepingOrAbove]

    def get(self, request):
        rooms = Room.objects.prefetch_related('beds').all()
        serializer = HousekeepingRoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def post(self, request):
        target_type = request.data.get('target_type') # 'room' o 'bed'
        target_id = request.data.get('target_id')
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        if new_status not in dict(PhysicalStatus.choices):
            return Response({'error': 'Estado físico inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        if target_type == 'room':
            room = Room.objects.get(id=target_id)
            old_status = room.physical_status
            room.physical_status = new_status
            if notes:
                room.notes = notes
            room.save()
            # Sincronizar todas las camas de la habitación
            room.beds.all().update(physical_status=new_status)

            AuditLog.objects.create(
                user=request.user,
                action=AuditAction.STATUS_CHANGE,
                entity_type='ROOM',
                entity_id=room.number,
                description=f"[Limpieza Móvil] Hab {room.number} cambiada a {new_status} por {request.user.username}."
            )
            return Response({'message': f'Habitación {room.number} actualizada a {new_status}.'})

        elif target_type == 'bed':
            bed = Bed.objects.select_related('room').get(id=target_id)
            old_status = bed.physical_status
            bed.physical_status = new_status
            if notes:
                bed.notes = notes
            bed.save()

            AuditLog.objects.create(
                user=request.user,
                action=AuditAction.STATUS_CHANGE,
                entity_type='BED',
                entity_id=f"{bed.room.number}-{bed.number}",
                description=f"[Limpieza Móvil] Cama {bed.number} (Hab {bed.room.number}) cambiada a {new_status} por {request.user.username}."
            )
            return Response({'message': f'Cama {bed.number} actualizada a {new_status}.'})

        return Response({'error': 'target_type debe ser "room" o "bed".'}, status=status.HTTP_400_BAD_REQUEST)


class MaintenanceBlockViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceBlock.objects.select_related('room', 'bed', 'created_by').all()
    serializer_class = MaintenanceBlockSerializer
    permission_classes = [IsReceptionOrAdmin]

    def perform_create(self, serializer):
        block = serializer.save(created_by=self.request.user)
        AuditLog.objects.create(
            user=self.request.user,
            action=AuditAction.MAINTENANCE,
            entity_type='MAINTENANCE',
            entity_id=str(block.id),
            description=f"Bloqueo por mantenimiento creado: {block.reason} ({block.start_date} al {block.end_date})."
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole] # Solo Administrador (Víctor)


class DashboardStatsView(APIView):
    permission_classes = [IsReceptionOrAdmin]

    def get(self, request):
        today = timezone.localdate()
        total_rooms = Room.objects.count()
        total_beds = Bed.objects.filter(is_active=True).count()

        active_reservations_today = Reservation.objects.filter(
            status__in=[ReservationStatus.CONFIRMADA, ReservationStatus.CHECK_IN],
            check_in_date__lte=today,
            check_out_date__gt=today
        )

        occupied_beds_today = Bed.objects.filter(reservations__in=active_reservations_today).distinct().count()
        occupancy_rate = round((occupied_beds_today / total_beds * 100), 1) if total_beds > 0 else 0

        check_ins_today = Reservation.objects.filter(
            check_in_date=today,
            status__in=[ReservationStatus.CONFIRMADA, ReservationStatus.PENDIENTE_SENA]
        ).count()

        check_outs_today = Reservation.objects.filter(
            check_out_date=today,
            status=ReservationStatus.CHECK_IN
        ).count()

        dirty_rooms = Room.objects.filter(physical_status=PhysicalStatus.DIRTY).count()
        dirty_beds = Bed.objects.filter(physical_status=PhysicalStatus.DIRTY).count()

        pending_deposits = Reservation.objects.filter(status=ReservationStatus.PENDIENTE_SENA).count()

        return Response({
            'total_rooms': total_rooms,
            'total_beds': total_beds,
            'occupied_beds_today': occupied_beds_today,
            'available_beds_today': total_beds - occupied_beds_today,
            'occupancy_rate': occupancy_rate,
            'check_ins_today': check_ins_today,
            'check_outs_today': check_outs_today,
            'dirty_units_count': dirty_rooms + dirty_beds,
            'pending_deposits_count': pending_deposits
        })
