import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Service

services = [
    {"name": "Saç Kesimi", "description": "Klasik ve modern saç kesimi.", "price": 200, "duration_minutes": 30},
    {"name": "Sakal Kesimi", "description": "Sakal şekillendirme ve kesimi.", "price": 100, "duration_minutes": 30},
    {"name": "Saç + Sakal Kesimi", "description": "Saç ve sakal kesimi kombosu.", "price": 280, "duration_minutes": 60},
    {"name": "Cilt Bakımı", "description": "Yüz maskesi ve temizlik.", "price": 150, "duration_minutes": 30},
]

for s in services:
    Service.objects.get_or_create(name=s["name"], defaults=s)
print("Initial data created.")
