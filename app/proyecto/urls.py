"""
URL configuration for proyecto project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('web.urls')),
    path('api/', include('web.api.urls')),
    # FIX #4: eliminado el include duplicado bajo "hola/"
    # (creaba rutas duplicadas como /hola/sistema-solar/, /hola/sync/, etc.)
]
