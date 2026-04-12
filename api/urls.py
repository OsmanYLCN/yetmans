from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, GalleryImageViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'gallery', GalleryImageViewSet)
router.register(r'appointments', AppointmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
