# Cripto CoinGecko Backend

Backend en Node.js, TypeScript y Express para un dashboard de criptomonedas. La API usa arquitectura por capas, JWT para autenticacion propia, Firebase Admin SDK para Firestore y CoinGecko para datos de mercado.

## Requisitos

- Node.js 22 o superior.
- Un proyecto Firebase con Firestore habilitado.
- Credenciales Firebase Admin para desarrollo local o Application Default Credentials en Google Cloud Run.

## Instalacion local

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

La API queda disponible en `http://localhost:8080/api`.

## Scripts

```bash
npm run dev        # Ejecuta src/server.ts con recarga
npm run typecheck  # Valida tipos TypeScript sin emitir archivos
npm run build      # Compila TypeScript a dist/
npm start          # Ejecuta dist/src/server.js
npm test           # Ejecuta pruebas con node:test y tsx
```

## Variables de entorno principales

- `PORT`: puerto HTTP. Cloud Run usa `8080` por defecto.
- `CORS_ORIGIN`: origen del frontend, por ejemplo `http://localhost:5173`.
- `JWT_SECRET`: secreto largo para firmar tokens JWT.
- `JWT_EXPIRES_IN`: duracion del token, por ejemplo `1d`.
- `FIRESTORE_USERS_COLLECTION`: coleccion de usuarios en Firestore.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: credenciales locales por campos.
- `FIREBASE_SERVICE_ACCOUNT_BASE64`: alternativa para inyectar el JSON completo en base64.
- `COINGECKO_API_KEY`: opcional si usas una API key de CoinGecko.
- `COINGECKO_CACHE_TTL_MS`: cache en memoria para respuestas de CoinGecko. Por defecto `60000`.

## Endpoints

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
GET    /api/auth/me
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
GET    /api/cryptocurrencies/dashboard?limit=10&vsCurrency=usd
GET    /api/cryptocurrencies/top?limit=10&vsCurrency=usd
GET    /api/cryptocurrencies/global?vsCurrency=usd
GET    /api/cryptocurrencies/:id/market-chart?days=7&vsCurrency=usd
```

Las rutas de `/api/users` y `/api/auth/me` requieren header:

```text
Authorization: Bearer <jwt>
```

## Datos para dashboard

El frontend puede empezar consumiendo `GET /api/cryptocurrencies/dashboard`, que devuelve:

- `topCryptocurrencies`: top 10 por market cap con precio, variaciones 1h/24h/7d, market cap, volumen, sparkline 7d y ultima actualizacion.
- `kpis`: KPIs generales del mercado, incluyendo criptomonedas activas, exchanges/markets, market cap total, volumen total, cambio 24h y dominancia.
- `charts`: datos de sparkline 7d por moneda para mini-graficas.
- `lastUpdated`: fecha/hora consolidada de ultima actualizacion.

Para graficas detalladas por moneda, usa `GET /api/cryptocurrencies/:id/market-chart`, que devuelve series de precio, market cap y volumen.

Las respuestas de CoinGecko usan cache en memoria por URL para reducir errores `429`. Si CoinGecko limita temporalmente las peticiones y existe una respuesta previa en cache, el backend devuelve esa respuesta anterior como fallback.

## Pruebas

```bash
npm run typecheck
npm run build
npm test
```

Las pruebas iniciales cubren health check y validaciones que no requieren credenciales Firebase. Para pruebas de integracion con Firestore, configura `.env` con credenciales reales o usa emuladores de Firebase.

## Despliegue en Cloud Run

El `Dockerfile` escucha el puerto definido por `PORT`, usa Node 22, compila TypeScript y ejecuta `dist/src/server.js`. En Cloud Run se recomienda:

- Usar Secret Manager para `JWT_SECRET` y credenciales sensibles.
- Preferir Application Default Credentials asignando una service account al servicio.
- Configurar `CORS_ORIGIN` con la URL real del frontend.

## Documentacion adicional

- [Arquitectura](docs/ARCHITECTURE.md)
- [Acceptance criteria](docs/ACCEPTANCE_CRITERIA.md)
- [Estrategia de pruebas](docs/TESTING.md)
