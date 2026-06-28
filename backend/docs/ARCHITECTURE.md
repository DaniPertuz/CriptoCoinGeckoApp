# Decisiones de arquitectura

## Objetivo

Construir una API mantenible para un dashboard fullstack de criptomonedas, con separacion clara de responsabilidades, contratos internos tipados con TypeScript y preparada para crecer hacia autenticacion social, Firestore y despliegue en Cloud Run.

## Capas

- `routes`: define URLs, middlewares por endpoint y validadores.
- `controllers`: traduce HTTP a llamadas de servicio y respuestas JSON.
- `services`: concentra reglas de negocio, errores de dominio y orquestacion.
- `repositories`: encapsula acceso a Firestore.
- `models`: normaliza entidades internas y evita exponer datos sensibles.
- `middlewares`: auth, validacion, 404 y manejo centralizado de errores.
- `config`: variables de entorno, Firebase Admin y clientes externos.
- `validators`: esquemas Zod para body, params y query.
- `types`: interfaces y tipos compartidos para usuarios, auth, criptomonedas y extensiones de Express.

## TypeScript

El backend usa `strict: true` para detectar inconsistencias antes de ejecutar la aplicacion. Los tipos principales viven en `src/types`:

- `User`, `NewUser`, `SafeUser`, `AuthResponse` y payloads de auth/CRUD.
- `CryptoMarketCoin` y `CoinGeckoMarketCoin` para separar el contrato externo del contrato interno.
- Extension de `Express.Request` para tipar `req.auth` despues del middleware JWT.

Zod sigue validando datos en runtime. TypeScript protege contratos internos durante desarrollo y build; Zod protege entradas HTTP reales.

## Autenticacion

La autenticacion email/password usa usuarios propios guardados en Firestore con password hasheada mediante `bcryptjs`. El login emite un JWT firmado con `JWT_SECRET`.

La ruta `POST /api/auth/google` queda preparada para recibir un Firebase/Google ID token. Firebase Admin verifica el token, crea el usuario si no existe y devuelve el JWT interno de la API. Asi el frontend puede usar Google sin cambiar la autorizacion del backend.

## Firestore

El repositorio de usuarios es la unica capa que conoce Firestore. Los servicios trabajan con objetos de dominio tipados. Esto facilita cambiar la persistencia, mockear pruebas o agregar indices/paginacion luego.

## CoinGecko

La integracion vive en `crypto.service.ts` porque actualmente no persiste datos. El servicio transforma la respuesta externa a contratos estables para el frontend y maneja timeouts/errores externos con codigos propios.

La API propia expone:

- `/api/cryptocurrencies/dashboard`: respuesta agregada para cargar el dashboard inicial.
- `/api/cryptocurrencies/top`: tabla top por market cap con precio, variaciones, volumen, market cap y sparkline.
- `/api/cryptocurrencies/global`: KPIs generales del mercado desde CoinGecko `/global`.
- `/api/cryptocurrencies/:id/market-chart`: series historicas de precio, market cap y volumen para graficas detalladas.

## Errores

Los errores operacionales usan `AppError`. El middleware global convierte errores a una respuesta consistente:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed"
  }
}
```

## Cloud Run

La aplicacion no depende de estado local, respeta `PORT`, incluye `Dockerfile`, compila TypeScript a `dist/` y permite usar Application Default Credentials. Los secretos deben inyectarse como variables de entorno o Secret Manager.
