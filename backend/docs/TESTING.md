# Especificaciones basicas para pruebas

## Unitarias

- Validadores: payloads validos e invalidos para auth, usuarios y criptomonedas.
- Servicios de auth: registro exitoso, email duplicado, login exitoso, credenciales invalidas.
- Servicios de usuarios: CRUD, sanitizacion, email duplicado y usuario inexistente.
- Servicio CoinGecko: respuesta exitosa, timeout y respuesta no exitosa del proveedor.
- Tipos: `npm run typecheck` debe pasar antes de integrar cambios.

## Integracion

- `GET /api/health` debe responder `200`.
- `POST /api/auth/register` debe crear usuario real en Firestore cuando hay credenciales configuradas.
- `POST /api/auth/login` debe devolver JWT valido.
- `GET /api/auth/me` debe rechazar requests sin token y aceptar token valido.
- `GET /api/cryptocurrencies/top` debe devolver una lista normalizada.
- `GET /api/cryptocurrencies/global` debe devolver KPIs normalizados.
- `GET /api/cryptocurrencies/:id/market-chart` debe devolver series historicas normalizadas.
- `GET /api/cryptocurrencies/dashboard` debe devolver top, KPIs, datos para graficas y `lastUpdated`.

## Manual

0. Verificar tipos, build y pruebas automatizadas:

```bash
npm run typecheck
npm run build
npm test
```

1. Crear `.env` desde `.env.example`.
2. Configurar `JWT_SECRET`.
3. Configurar Firebase Admin o Application Default Credentials.
4. Ejecutar `npm run dev`.
5. Verificar health:

```bash
curl http://localhost:8080/api/health
```

6. Registrar usuario:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Daniel Pertuz","email":"daniel@example.com","password":"Password123"}'
```

7. Usar el token para consultar perfil:

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <jwt>"
```

8. Consultar CoinGecko:

```bash
curl "http://localhost:8080/api/cryptocurrencies/top?limit=10&vsCurrency=usd"
```

9. Consultar datos agregados del dashboard:

```bash
curl "http://localhost:8080/api/cryptocurrencies/dashboard?limit=10&vsCurrency=usd"
```

10. Consultar grafica detallada por moneda:

```bash
curl "http://localhost:8080/api/cryptocurrencies/bitcoin/market-chart?days=7&vsCurrency=usd"
```

## Datos necesarios para pruebas manuales completas

- Project ID de Firebase.
- Service account local o permisos ADC.
- URL permitida del frontend para `CORS_ORIGIN`.
- API key de CoinGecko si tu cuenta o cuota lo requiere.
