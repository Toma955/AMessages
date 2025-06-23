# Grafana Setup Guide

## Opcija 1: Docker (preporučeno)

### 1. Pokrenite servise
```bash
docker compose up -d
```

### 2. Pristupite Grafani
- URL: http://localhost:3001
- Username: admin
- Password: admin

### 3. Dodajte Prometheus data source
1. Configuration → Data Sources
2. Add data source → Prometheus
3. URL: http://prometheus:9090
4. Save & Test

## Opcija 2: Direktna instalacija

### 1. Preuzmite Grafana
- Windows: https://grafana.com/grafana/download
- Ili koristite Chocolatey: `choco install grafana`

### 2. Pokrenite Grafana
```bash
# Windows
grafana-server.exe

# Ili kao Windows servis
grafana-server.exe --service install
grafana-server.exe --service start
```

### 3. Pristupite Grafana
- URL: http://localhost:3000
- Username: admin
- Password: admin

### 4. Dodajte Prometheus data source
1. Configuration → Data Sources
2. Add data source → Prometheus
3. URL: http://localhost:9090 (gdje je vaš Prometheus)
4. Save & Test

## Korisni PromQL upiti za dashboard

### CPU Usage
```
rate(process_cpu_seconds_total[5m]) * 100
```

### Memory Usage
```
process_resident_memory_bytes / 1024 / 1024
```

### HTTP Requests
```
rate(http_requests_total[5m])
```

### Response Time
```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Active Connections
```
nodejs_active_handles_total
```

## Preporučeni dashboardi
1. **System Overview** - CPU, Memory, Disk
2. **Application Metrics** - HTTP requests, response times
3. **Database Metrics** - connections, query times
4. **Custom Business Metrics** - user registrations, messages sent 