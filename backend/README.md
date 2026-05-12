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

## Rutas incluidas

- `GET /api/health`: prueba la conexion con PostgreSQL.
- `GET /api/services`: devuelve los servicios activos.
- `POST /api/login`: busca un usuario por correo. Falta agregar validacion real de password con hash antes de usarlo en produccion.
