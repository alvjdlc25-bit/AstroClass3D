import json
from django.core.management.base import BaseCommand
from web.models import Planeta, Luna


class Command(BaseCommand):
    def handle(self, *args, **kwargs):

        # =========================
        # PLANETAS
        # =========================
        file_path_planetas = "web/data/planetas.json"

        with open(file_path_planetas, "r", encoding="utf-8") as file:
            data = json.load(file)

        for p in data:

            Planeta.objects.update_or_create(
                nombre=p["nombre"],
                defaults={
                    "gravedad": p.get("gravedad"),
                    "diametro_km": p.get("diametro_km"),
                    "densidad": p.get("densidad"),
                    "masa": p.get("masa"),
                    "distancia_sol_mill_km": p.get("distancia_sol_mill_km"),
                    "descripcion": p.get("descripcion"),
                    "imagen": p.get("imagen"),
                    "wiki_url": p.get("wiki_url"),
                }
            )

        self.stdout.write(self.style.SUCCESS("Planetas cargados desde JSON"))

        # =========================
        # LUNAS
        # =========================
        file_path_lunas = "web/data/lunas.json"

        with open(file_path_lunas, "r", encoding="utf-8") as file:
            lunas_data = json.load(file)

        for l in lunas_data:

            try:
                planeta = Planeta.objects.get(id=l["planeta_id"])
            except Planeta.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Planeta ID {l['planeta_id']} no existe para luna {l['nombre']}"
                    )
                )
                continue

            Luna.objects.update_or_create(
                nombre=l["nombre"],
                planeta=planeta,
                defaults={
                    "diametro_km": l.get("diametro_km"),
                    "anio_descubrimiento": l.get("anio_descubrimiento"),
                    "descripcion": l.get("descripcion"),
                    "imagen": l.get("imagen"),
                    "wiki_url": l.get("wiki_url"),
                }
            )

        self.stdout.write(self.style.SUCCESS("Lunas cargadas desde JSON"))