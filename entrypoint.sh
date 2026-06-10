#!/bin/sh

echo "Aplicando migraciones..."
python manage.py migrate

echo "Sincronizando planetas..."
python manage.py sync_planetas

echo "Arrancando Django..."
python manage.py runserver 0.0.0.0:8000