from django.contrib import admin
from .models import Service, GalleryImage, Appointment

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration_minutes')

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone', 'date', 'time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('first_name', 'last_name', 'phone')
