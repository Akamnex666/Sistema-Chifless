# ========================================
# Stage 1: Builder
# ========================================
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Instalar certificados CA para HTTPS
RUN apk add --no-cache ca-certificates

# Copiar archivos de dependencias
COPY go.mod go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar código fuente
COPY . .

# Compilar binario estático
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o websocket-server .

# ========================================
# Stage 2: Runner (imagen mínima)
# ========================================
FROM scratch

WORKDIR /app

# Copiar certificados CA
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copiar binario compilado
COPY --from=builder /app/websocket-server .

# Puerto por defecto
ENV PORT=8080
ENV WS_SECRET=""
ENV ALLOWED_ORIGIN="*"

EXPOSE 8080

# Health check no disponible en scratch, se puede usar con alpine si es necesario
# Para monitoreo externo, usar un endpoint HTTP /health

ENTRYPOINT ["./websocket-server"]
