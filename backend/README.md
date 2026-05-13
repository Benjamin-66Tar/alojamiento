# Backend Hotel

API basica para conectar la app React con PostgreSQL.

## 1. Configurar variables

Copia `.env.example` a `.env` y cambia la contrasena:

```txt
PORT=3001
PGHOST=localhost
PGPORT=5432
PGDATABASE=Hotel
PGUSER=postgres
PGPASSWORD=TU_PASSWORD
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Crear tablas

Desde la carpeta `estetica`, ejecuta el SQL que ya existe:

```bash
psql -U postgres -d Hotel -f database/schema.sql
```

## 4. Iniciar API

```bash
npm run dev
```

Prueba la conexion en:

```txt
http://localhost:3001/api/health
```

Swagger UI esta disponible en:

```txt
http://localhost:3001/api-docs
```

La especificacion OpenAPI en JSON esta disponible en:

```txt
http://localhost:3001/openapi.json
```

## Rutas incluidas

- `GET /api/health`: prueba la conexion con PostgreSQL.
- `GET /api/services`: devuelve los servicios activos.
- `POST /api/login`: inicia sesion con correo y contrasena.
- `POST /api/register`: registra un nuevo huesped.
- `GET /api/profile/:id`: devuelve el perfil de un usuario.
