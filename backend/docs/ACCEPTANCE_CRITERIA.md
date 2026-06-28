# Acceptance criteria

## Configuracion

- La API carga variables desde `.env`.
- La aplicacion falla al iniciar si `JWT_SECRET` no cumple el minimo de seguridad.
- El puerto es configurable con `PORT`.
- CORS permite configurar el origen del frontend con `CORS_ORIGIN`.
- `npm run typecheck` termina sin errores.
- `npm run build` genera la salida compilada en `dist/`.

## TypeScript

- El proyecto usa `strict: true`.
- Los contratos internos principales estan tipados con interfaces o type aliases.
- `req.auth` esta tipado mediante extension de Express.
- Los payloads de usuario, auth y criptomonedas tienen tipos compartidos.

## Autenticacion email/password

- `POST /api/auth/register` crea un usuario con email unico.
- La password nunca se devuelve en respuestas HTTP.
- La password se guarda hasheada, no en texto plano.
- `POST /api/auth/login` devuelve usuario sanitizado y JWT.
- Credenciales invalidas devuelven `401`.
- Payloads invalidos devuelven `400` con `VALIDATION_ERROR`.

## Preparacion Google

- `POST /api/auth/google` acepta `idToken`.
- El token se verifica con Firebase Admin.
- Si el usuario existe por `googleId` o email, se actualiza el vinculo.
- Si no existe, se crea un usuario con provider `google`.
- La respuesta mantiene el mismo contrato que login email/password.

## Usuarios

- Las rutas `/api/users` requieren JWT.
- Se puede crear, listar, consultar, actualizar y eliminar usuarios.
- Los emails se normalizan a minusculas.
- Emails duplicados devuelven `409`.
- Usuarios inexistentes devuelven `404`.

## Firestore

- El acceso a Firestore esta encapsulado en repositories.
- La coleccion de usuarios es configurable con `FIRESTORE_USERS_COLLECTION`.
- La aplicacion puede usar credenciales explicitas o Application Default Credentials.

## CoinGecko

- `GET /api/cryptocurrencies/top` devuelve por defecto las top 10 criptomonedas por market cap.
- `limit` permite ajustar la cantidad entre 1 y 50.
- `vsCurrency` permite cambiar la moneda de referencia.
- El top incluye precio actual, variaciones 1h/24h/7d, market cap, volumen, ranking, sparkline 7d y ultima actualizacion.
- `GET /api/cryptocurrencies/global` devuelve KPIs generales del mercado.
- `GET /api/cryptocurrencies/:id/market-chart` devuelve series de precio, market cap y volumen.
- `GET /api/cryptocurrencies/dashboard` devuelve top, KPIs, datos para mini-graficas y fecha consolidada de ultima actualizacion.
- Errores de CoinGecko devuelven codigos controlados como `COINGECKO_REQUEST_FAILED`, `COINGECKO_TIMEOUT` o `COINGECKO_UNAVAILABLE`.

## Errores y validacion

- Todos los errores usan una respuesta JSON consistente.
- Zod valida `body`, `params` y `query` antes de llegar a controllers.
- Rutas inexistentes devuelven `404` con `ROUTE_NOT_FOUND`.

## Despliegue

- El backend incluye `Dockerfile`.
- El contenedor expone `8080`.
- El build compila TypeScript antes de ejecutar la aplicacion.
- El comando de produccion es `node dist/src/server.js`.
