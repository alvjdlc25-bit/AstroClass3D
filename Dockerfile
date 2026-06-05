FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Dependencias Python
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copiar proyecto
COPY ./app /app

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]