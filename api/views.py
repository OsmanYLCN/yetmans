from rest_framework import viewsets, generics, views
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from datetime import datetime, time, timedelta

from .models import Service, GalleryImage, Appointment
from .serializers import ServiceSerializer, GalleryImageSerializer, AppointmentSerializer, AdminAppointmentSerializer

class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class GalleryImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request and self.request.query_params.get('admin'):
            return AdminAppointmentSerializer
        return AppointmentSerializer
        
    @action(detail=False, methods=['get'], url_path='available-slots')
    def available_slots(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({"error": "Date parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format, use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 10:00 to 20:00, 30 min slots
        slots = []
        current_time = datetime.combine(target_date, time(10, 0))
        end_time = datetime.combine(target_date, time(20, 0))
        
        while current_time < end_time:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
            
        # Get booked slots for the target date
        booked_appointments = Appointment.objects.filter(
            date=target_date,
            status__in=['pending', 'confirmed']
        )
        booked_times = [appt.time for appt in booked_appointments]
        
        available = [t.strftime('%H:%M') for t in slots if t not in booked_times]
        
        return Response({"available_slots": available})
