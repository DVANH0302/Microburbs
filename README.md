# Analyst Developer — Local Docker run

Result:
<img width="945" height="412" alt="image" src="https://github.com/user-attachments/assets/8b2720a6-98a3-460b-8847-5b9441043afe" />

This repository contains two services:
- `be/` — Flask backend (API)
- `fe/` — React frontend

This README shows how to run both services locally using Docker and docker-compose.

## Prerequisites
- Docker Desktop (Windows)
- Docker Compose (bundled with Docker Desktop)

## Run with docker-compose (recommended)
From the repository root:

```powershell
# Build and start both services (backend on 5000, frontend on 3000)
docker compose up --build

# Stop and remove containers
docker compose down
```

The frontend is served by nginx at http://localhost:3000 and the backend API is available at http://localhost:5000/api/properties.

NOTE: The compose file builds the frontend with `REACT_APP_API_URL` set to `http://host.docker.internal:5000`, which allows the frontend container to reach the backend running on your host.

## Build and run images individually
Backend:
```powershell
docker build -t anlyst-backend -f be/Dockerfile .
docker run --rm -p 5000:5000 --name anlyst-backend anlyst-backend
```

Frontend (static build served by nginx):
```powershell
cd fe
docker build -t anlyst-frontend --build-arg REACT_APP_API_URL="http://host.docker.internal:5000" .
docker run --rm -p 3000:80 --name anlyst-frontend anlyst-frontend
```
