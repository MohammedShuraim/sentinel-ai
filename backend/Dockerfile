FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install CPU-only torch/torchvision first (official PyTorch CPU index).
# Then install remaining deps from requirements.txt excluding those pins so
# pip does not replace them with default CUDA wheels from PyPI.
RUN pip install --upgrade pip \
    && pip install torch==2.7.1 torchvision==0.22.1 \
        --index-url https://download.pytorch.org/whl/cpu \
    && grep -vE '^(torch|torchvision)==' requirements.txt > /tmp/requirements.docker.txt \
    && pip install -r /tmp/requirements.docker.txt \
    && rm /tmp/requirements.docker.txt

COPY . .

RUN useradd --create-home --shell /bin/bash appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
