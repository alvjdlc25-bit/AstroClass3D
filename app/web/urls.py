from django.urls import path
from . import views

urlpatterns = [
    # 🪐 Vista principal (lista planetas desde MySQL)
    path('', views.hola, name='hola'),

    # 🌌 Sistema solar 3D (usa la vista `sistema_solar` que precarga las lunas)
    # FIX #5: la ruta '/hola/ → sistema_solar' con name="hola" se eliminó
    # (causaba colisión de nombre y URLs duplicadas).
    path('sistema-solar/', views.sistema_solar, name='sistema_solar'),

    # 🔄 Sincronizar datos desde APIs (sistema solar + Wikipedia)
    path('sync/', views.sincronizar_planetas, name='sync_planetas'),

    # 🔌 API JSON para consultar un planeta por nombre
    path('api/planeta/<int:id>/', views.planeta_api, name='planeta_api'),
]
