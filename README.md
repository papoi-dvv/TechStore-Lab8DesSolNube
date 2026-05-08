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

## Requisitos previos

### MySQL con XAMPP

Este proyecto requiere una base de datos MySQL activa. Se recomienda usar **XAMPP** para levantarla localmente.

1. Descarga e instala [XAMPP](https://www.apachefriends.org/) si aún no lo tienes.
2. Abre el **Panel de Control de XAMPP** y arranca el módulo **MySQL** (y Apache si lo necesitas).
3. Abre **phpMyAdmin** en `http://localhost/phpmyadmin`.
4. Crea una nueva base de datos con el nombre exacto:

```
TechStore
```

> Sequelize creará las tablas automáticamente al iniciar el backend por primera vez gracias a `sync`.

5. Asegúrate de que las credenciales en `backend/.env` coincidan con las de tu instalación de XAMPP (por defecto: usuario `root`, sin contraseña):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=TechStore
DB_USER=root
DB_PASSWORD=
```

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

Esto crea 4 cuentas con todos los perfiles de usuario:

- **Administrador**: `admin@techstore.com` / `Admin123!`
- **Gerente de Tienda**: `gerente@techstore.com` / `Manager123!`
- **Empleado de Ventas**: `empleado@techstore.com` / `Employee123!`
- **Auditor**: `auditor@techstore.com` / `Auditor123!`

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

## Cómo usar MFA

1. Inicia sesión con tu usuario.
2. En el dashboard, haz clic en `Activar MFA`.
3. Aparecerá un código QR y una clave secreta.
4. Escanea el QR con una app de autenticación (Google Authenticator, Authy, Microsoft Authenticator, etc.) o copia la clave manualmente.
5. Cierra sesión y vuelve a iniciar sesión.
6. Después de ingresar email y contraseña, el sistema pedirá un código de 6 dígitos.
7. Introduce el código generado por tu app de autenticación para completar el inicio de sesión.
