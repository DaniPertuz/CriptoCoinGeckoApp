# Cripto CoinGecko Frontend

Frontend en React, TypeScript y Vite para autenticacion, gestion de usuarios y dashboard privado de mercado cripto.

## Requisitos

- Node.js 22 o compatible con la version de Vite instalada.
- Backend corriendo en `http://localhost:8080/api`.
- Configuracion publica de Firebase Web App para login con Google.

## Instalacion local

```bash
cd coingeckoapp
npm install
cp .env.example .env
npm run dev
```

## Variables

- `VITE_API_BASE_URL`: URL base del backend.
- `VITE_FIREBASE_API_KEY`: API key publica de Firebase.
- `VITE_FIREBASE_AUTH_DOMAIN`: auth domain de Firebase.
- `VITE_FIREBASE_PROJECT_ID`: project id de Firebase.
- `VITE_FIREBASE_APP_ID`: app id web de Firebase.

## Google Login

Si aparece `Firebase: Error (auth/configuration-not-found)`, revisa en Firebase Console:

- Authentication debe estar habilitado para el proyecto.
- En Authentication > Sign-in method, el proveedor Google debe estar habilitado.
- Las variables `VITE_FIREBASE_*` deben corresponder a la misma Web App del mismo proyecto Firebase que usa el backend.
- En Authentication > Settings > Authorized domains, agrega `localhost` para desarrollo y el dominio de Cloud Run cuando despliegues.

Despues de cambiar `.env`, reinicia `npm run dev`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Funcionalidades

- Registro, login, logout y login con Google.
- Rutas privadas protegidas con JWT.
- Dashboard con top 10, KPIs, dominancia y graficas.
- Gestion basica de usuarios.
- Dockerfile para Cloud Run sirviendo `dist/` con Nginx en puerto `8080`.

El frontend consume exclusivamente la API propia del backend.
