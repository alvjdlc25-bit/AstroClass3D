import requests
from django.shortcuts import render
from .models import Planeta
from django.http import JsonResponse


from django.http import JsonResponse
from .models import Planeta

def planeta_api(request, id):

    try:
        planeta = Planeta.objects.get(id=id)

        return JsonResponse({
            "id": planeta.id,
            "nombre": planeta.nombre,
            "gravedad": planeta.gravedad,
            "densidad": planeta.densidad,
            "masa": planeta.masa,
            "total_lunas": planeta.lunas.count(),
            "lunas": list(planeta.lunas.values("nombre", "diametro_km")),
            "distancia_sol_mill_km": planeta.distancia_sol_mill_km,
            "descripcion": planeta.descripcion,
            "imagen": planeta.imagen  
        })

    except Planeta.DoesNotExist:
        return JsonResponse({
            "error": "Planeta no encontrado",
            "debug": id
        }, status=404)
    
    
def hola(request):
    planetas = Planeta.objects.all()

    return render(request, 'web/index.html', {
        'planetas': planetas
    })

def mapa_astronomico(request):
    return render(request, 'web/sistema_solar.html')


def sincronizar_planetas(request):

    # FIX #2: URL corregida (antes: api.le-systeme-le-solaire.net)
    api_solar = "https://api.le-systeme-solaire.net/rest/bodies/"

    # FIX #15: eliminada cabecera Authorization innecesaria (API pública)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    }

    try:
        # 🪐 API sistema solar
        response = requests.get(
                api_solar,
                headers=headers,
                timeout=10
            )
        response.raise_for_status()
        data = response.json()

        for body in data.get("bodies", []):

            if not body.get("isPlanet"):
                continue

            nombre = body.get("englishName")

            # 🌍 Wikipedia (REFACTORIZADO)
            wiki_data = safe_wiki(nombre)

            descripcion = wiki_data.get("extract")

            imagen = None
            if wiki_data.get("thumbnail"):
                imagen = wiki_data["thumbnail"].get("source")

            # FIX #3: extraer valor numérico real de la masa
            # La API devuelve mass como {"massValue": X, "massExponent": Y}
            mass_obj = body.get("mass") or {}
            masa_val = None
            if mass_obj.get("massValue") is not None and mass_obj.get("massExponent") is not None:
                masa_val = mass_obj["massValue"] * (10 ** mass_obj["massExponent"])

            Planeta.objects.update_or_create(
                nombre=nombre,
                defaults={
                    "gravedad": body.get("gravity"),
                    "densidad": body.get("density"),
                    "masa": masa_val,
                    # FIX #1: campo `lunas` ELIMINADO del modelo Planeta
                    # (ahora es relación inversa a través del modelo Luna)

                    # Wikipedia
                    "descripcion": descripcion,
                    "imagen": imagen,
                    "wiki_url": wiki_data.get("content_urls", {})
                        .get("desktop", {})
                        .get("page"),
                }
            )

        return JsonResponse({
            "status": "ok",
            "message": "Planetas sincronizados correctamente"
        })

    except Exception as e:
        # FIX #14: devolver código HTTP 500 cuando hay error
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=500)
    

def safe_wiki(nombre):
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{nombre}"
        r = requests.get(url, timeout=5)
        return r.json()
    except Exception:  # FIX #10: except específico, no desnudo
        return {}



def sistema_solar(request):
    planetas = Planeta.objects.prefetch_related("lunas").all()

    return render(request, "web/sistema_solar.html", {
        "planetas": planetas
    })