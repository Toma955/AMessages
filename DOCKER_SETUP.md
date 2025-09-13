# Docker Setup za AMessages

## 📋 Preduvjeti

- Docker Desktop instaliran i pokrenut
- Docker Compose v2+

## 🚀 Pokretanje aplikacije

### 1. Build Docker image-ova
```bash
npm run docker:build
```

### 2. Pokretanje svih servisa
```bash
npm run docker:up
```

### 3. Pokretanje u background modu
```bash
npm run docker:up -d
```

### 4. Zaustavljanje
```bash
npm run docker:down
```

### 5. Restart
```bash
npm run docker:restart
```

### 6. Pregled logova
```bash
npm run docker:logs
```

## 🌐 Dostupni servisi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

## 🔧 Environment varijable

### Backend
- `PORT`: 5001
- `JWT_SECRET`: amessages-super-secret-jwt-key-2025-production
- `ADMIN_USERNAME`: admin
- `ADMIN_PASSWORD`: admin
- `FRONTEND_URL`: http://localhost:3000

### Frontend
- `NEXT_PUBLIC_API_URL`: http://localhost:5001
- `NEXT_PUBLIC_SOCKET_URL`: http://localhost:5001

## 📁 Volume mape

- `./server/database` → `/app/database` (SQLite baze)
- `./server/media` → `/app/media` (audio datoteke)

## 🐛 Troubleshooting

### Docker daemon nije pokrenut
```bash
# Pokrenite Docker Desktop aplikaciju
# Ili pokrenite Docker daemon
sudo systemctl start docker
```

### Portovi su zauzeti
```bash
# Provjerite koji procesi koriste portove
lsof -i :3000
lsof -i :5001

# Zaustavite procese ili promijenite portove u docker-compose.yml
```

### Build greške
```bash
# Očistite Docker cache
docker system prune -a

# Ponovno build
npm run docker:build
```

## 📝 Napomene

- Prvi build može potrajati 5-10 minuta
- Backend će automatski inicijalizirati SQLite baze
- Frontend koristi Next.js standalone output za optimizaciju
- Svi servisi su povezani preko `amessages-network` Docker mreže
