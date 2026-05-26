# Despliegue en Ubuntu Server con Docker

Esta configuracion levanta PostgreSQL, el backend Express y el frontend React servido por Nginx.

## 1. Instalar Docker

En el servidor:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Opcional, para usar Docker sin `sudo`:

```bash
sudo usermod -aG docker $USER
```

Cierra sesion y vuelve a entrar.

## 2. Clonar la rama

```bash
git clone -b EDWARD --single-branch https://github.com/Benjamin-66Tar/alojamiento.git
cd alojamiento
```

## 3. Configurar variables

```bash
cp docker.env.example .env
nano .env
```

Cambia al menos:

```env
POSTGRES_PASSWORD=una_contrasena_segura
```

Para acceder por IP, deja:

```env
VITE_API_URL=
APP_PORT=80
```

Con `VITE_API_URL` vacio, el navegador usa `/api` en el mismo host o IP donde abriste la pagina.

## 4. Levantar la app

```bash
docker compose up -d --build
```

La primera vez, PostgreSQL carga automaticamente:

```txt
estetica/database/schema.sql
```

Abre:

```txt
http://IP_DEL_SERVIDOR
```

La API queda disponible mediante Nginx:

```txt
http://IP_DEL_SERVIDOR/api/health
http://IP_DEL_SERVIDOR/api-docs
```

## 5. Comandos utiles

Ver contenedores:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

Reiniciar:

```bash
docker compose restart
```

Actualizar despues de un nuevo commit:

```bash
git pull origin EDWARD
docker compose up -d --build
```

Apagar:

```bash
docker compose down
```

Apagar y borrar la base de datos:

```bash
docker compose down -v
```

## 6. Si tienes dominio

Apunta un registro DNS tipo `A` a la IP publica del servidor.

Ejemplo:

```txt
tudominio.com -> IP_DEL_SERVIDOR
```

Despues puedes poner otro Nginx en el host o un proxy como Caddy/Traefik para HTTPS. Si solo necesitas entrar por IP, no hace falta dominio.

## Nota importante

El SQL actual crea roles, servicios y tipos de reservacion, pero no crea un usuario administrador. Para entrar al dashboard administrativo necesitas registrar o insertar un usuario con rol `super-admin` o `gerente`.
