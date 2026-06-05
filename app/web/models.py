from django.db import models

# Create your models here.

class Planeta(models.Model):
    nombre = models.CharField(max_length=100)
    gravedad = models.FloatField(null=True, blank=True)
    diametro_km = models.FloatField(null=True, blank=True)
    densidad = models.FloatField(null=True, blank=True)
    masa = models.FloatField(null=True, blank=True)
    distancia_sol_mill_km = models.FloatField(null=True, blank=True)

    descripcion = models.TextField(blank=True, null=True)
    imagen = models.URLField(blank=True, null=True)
    wiki_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.nombre
    

class Luna(models.Model):
    nombre = models.CharField(max_length=100)
    planeta = models.ForeignKey(
        Planeta,
        on_delete=models.CASCADE,
        related_name="lunas"
    )

    diametro_km = models.FloatField(null=True, blank=True)  # FIX #8: permitir null
    anio_descubrimiento = models.IntegerField(
        null=True,
        blank=True
    )
    descripcion = models.TextField(blank=True)
    imagen = models.URLField(blank=True)
    wiki_url = models.URLField(blank=True)

    def __str__(self):
        return self.nombre

