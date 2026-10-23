# Norte — E-commerce de indumentaria

Tienda online full-stack hecha con Node.js, Express y MySQL. Incluye catálogo, carrito, compra con control de stock, autenticación con roles y un panel de administración para gestionar productos, pedidos e imágenes.

**Demo en vivo:** https://norte-xoch.onrender.com/catalog

> La demo corre en el plan gratuito de Render: si estuvo un rato sin visitas, la primera carga puede tardar hasta un minuto.


## Funcionalidades

**Tienda**
- Catálogo con fotos, precios y estado de stock (productos agotados)
- Carrito lateral que se guarda en el navegador
- Finalización de compra con validación de stock en el servidor
- Historial de compras de cada usuario
- Sección de contacto

**Cuentas**
- Registro e inicio de sesión
- Contraseñas guardadas con hash (bcrypt)
- Sesión con JWT en una cookie `httpOnly`
- Dos roles: `user` y `admin`

**Panel de administración** (solo para admins)
- Alta, edición y borrado de productos
- Subida de fotos a Cloudinary
- Listado de todos los pedidos y cambio de estado (pendiente, pagada, enviada)

## Tecnologías

| Capa | Herramientas |
|---|---|
| Backend | Node.js 22, Express |
| Base de datos | MySQL 8 (`mysql2`) |
| Vistas | EJS, HTML, CSS y JavaScript sin frameworks |
| Autenticación | bcrypt, jsonwebtoken, cookie-parser |
| Imágenes | multer + Cloudinary |
| Despliegue | Render (app), Aiven (MySQL), Cloudinary (imágenes) |

## Decisiones técnicas

- **Compra con transacción.** Crear la orden, sus items y descontar el stock ocurre en una sola transacción. Se usa `SELECT ... FOR UPDATE` para bloquear los productos mientras se procesa la compra, así dos compras simultáneas no pueden vender el mismo stock. Si algo falla, se hace `ROLLBACK` y no queda ninguna orden a medias.
- **Los precios salen del servidor.** El navegador solo envía el id y la cantidad de cada producto, y el total se calcula con los precios de la base. Modificar el carrito en el navegador no cambia lo que se cobra.
- **Sesión segura.** El JWT viaja en una cookie `httpOnly` con `sameSite: strict`, inaccesible desde JavaScript. Las rutas de administración pasan por un middleware de autenticación y otro de rol, y el rol nunca se acepta desde el formulario de registro.
- **Consultas parametrizadas** en todo el proyecto, y una lista blanca de columnas modificables en la edición de productos, para evitar inyección SQL.
- **Imágenes en Cloudinary.** El disco del hosting gratuito se borra en cada reinicio, así que las fotos se suben a un servicio externo y en la base solo se guarda su URL.
- **Arquitectura en capas.** Cada recurso se divide en rutas, controlador y modelo, con las consultas SQL aisladas en los modelos.

## Estructura

```
├── index.js            # servidor Express
├── config.js           # configuración a partir de variables de entorno
├── ecommerce.sql       # esquema de la base de datos
├── certs/              # certificado para conectar a MySQL con SSL
├── db/                 # pool de conexiones
├── models/             # consultas SQL
├── controllers/        # lógica de cada recurso
├── routes/             # definición de rutas
├── middlewares/        # autenticación, roles y subida de archivos
├── views/              # plantillas EJS
└── public/             # CSS y JavaScript del navegador
```

## Cómo correrlo en local

Requisitos: Node.js 22 o superior, MySQL 8 y una cuenta gratuita de Cloudinary.

```bash
git clone https://github.com/maximerlo04/NOMBRE-DEL-REPO.git
cd NOMBRE-DEL-REPO
npm install
```

1. Creá una base de datos en MySQL, seleccionala y ejecutá el contenido de `ecommerce.sql`.
2. Creá un archivo `.env` en la raíz (ver la tabla de abajo).
3. Iniciá el servidor:

```bash
npm run dev
```

4. Abrí http://localhost:3000.

Para tener un usuario administrador, registrate desde `/login` y después ejecutá en MySQL:

```sql
UPDATE users SET role = 'admin' WHERE username = 'tu-usuario';
```

Cerrá sesión y volvé a entrar para que el rol se actualice.

## Variables de entorno

```
SECRET_JWT_KEY=una-clave-larga-y-aleatoria
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Opcionales: por defecto se conecta a un MySQL local
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce
DB_SSL=false
```

| Variable | Descripción |
|---|---|
| `SECRET_JWT_KEY` | Clave con la que se firman los tokens de sesión |
| `CLOUDINARY_URL` | Credenciales de Cloudinary para subir imágenes |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL |
| `DB_SSL` | `true` para conectarse con SSL (necesario en Aiven) |

## Rutas principales

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/catalog` | Público | Página del catálogo |
| GET | `/products`, `/products/:id` | Público | Productos en JSON |
| POST | `/auth/register` | Público | Crear cuenta |
| POST | `/auth/login` | Público | Iniciar sesión |
| POST | `/auth/logout` | Público | Cerrar sesión |
| GET | `/auth/me` | Usuario | Datos de la sesión |
| POST | `/orders` | Usuario | Crear una compra |
| GET | `/orders` | Usuario | Historial de compras |
| POST, PATCH, DELETE | `/products`, `/products/:id` | Admin | Gestionar productos |
| PATCH | `/orders/:id/status` | Admin | Cambiar el estado de un pedido |
| POST | `/uploads` | Admin | Subir una imagen |
| GET | `/admin` | Admin | Panel de administración |

## Despliegue

La app corre en Render, con la base de datos en Aiven (MySQL) y las imágenes en Cloudinary. Las variables de entorno se cargan desde el panel de Render, y `DB_SSL=true` activa la conexión cifrada con el certificado de la carpeta `certs/`.

## Próximos pasos

- Búsqueda y filtros por categoría o talle
- Página de detalle de cada producto
- Talles y variantes
- Pasarela de pagos (por ejemplo, Mercado Pago)
- Formulario de contacto que guarde los mensajes
- Tests automatizados

## Autor

**Maximiliano Merlo**

- GitHub: [maximerlo04](https://github.com/maximerlo04)
- Portfolio: [codeworkss.netlify.app](https://codeworkss.netlify.app)
- LinkedIn: [Maximiliano Merlo](https://linkedin.com/in/maximiliano-merlo-2522483b5)
