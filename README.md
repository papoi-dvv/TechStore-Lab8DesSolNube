# TechStore Inventory Management

TechStore es un sistema de gestión de inventario para una cadena de tiendas de tecnología. El proyecto incluye un backend con control de acceso y un frontend React para administrar productos, usuarios, roles y MFA.

## Estructura del proyecto

- `backend/`: servidor Express + Sequelize para MySQL
- `frontend/`: aplicación React creada con Create React App

## Funcionalidades implementadas

- Autenticación con email y contraseña
- Validación de contraseña segura
- JWT para sesiones
- MFA TOTP usando `speakeasy`
- RBAC (Roles: Administrador, Gerente, Empleado, Auditor)
- ABAC para control de acceso sobre productos
- Gestión de productos con permisos por rol y tienda
- Gestión de roles y usuarios
- Auditoría básica de acciones
- Desbloqueo de usuarios bloqueados por el administrador

## Configuración

### Backend

1. Copia el archivo de ejemplo de entorno:

```powershell
copy backend\.env.example backend\.env
```

2. Ajusta las variables de conexión a la base de datos en `backend/.env`.

3. Instala dependencias:

```powershell
cd backend
npm install
```

4. Inicia el backend:

```powershell
npm run dev
```

### Frontend

1. Instala dependencias:

```powershell
cd frontend
npm install
```

2. Inicia la aplicación React:

```powershell
npm start
```

## Seeder de datos

Para crear usuarios de prueba:

```powershell
cd backend
npm run seed
```

Esto agrega:

- `admin@techstore.com` / `Admin123!` (Administrador)
- `gerente@techstore.com` / `Manager123!` (Gerente)

## Rutas principales

### Backend

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/login/mfa`
- `POST /api/auth/mfa/setup`
- `GET /api/roles`
- `POST /api/roles`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id/unlock`
- `GET /api/products`
- `POST /api/products`

## Notas

- El proyecto usa `backend/src` para el servidor y modelos.
- El frontend gestiona sesión con `localStorage` y consume el backend mediante fetch.
- Asegúrate de tener el backend corriendo en `http://localhost:4000` para que el frontend funcione correctamente.
