# Documentación Técnica - TuTiendaVirtual

## 📋 Estructura del Proyecto

```
ProyectoTienda/
├── Backend/              # API REST (Flask)
│   ├── main.py          # Aplicación principal con todos los endpoints
│   ├── requirements.txt  # Dependencias de Python
│   ├── Procfile         # Configuración para despliegue en Heroku
│   └── tienda.db        # Base de datos SQLite
│
├── Fronted/             # Aplicación Frontend (Next.js + React)
│   ├── app/             # Páginas y rutas de la aplicación
│   │   ├── page.tsx                    # Página principal - lista de productos
│   │   ├── auth/                       # Rutas de autenticación
│   │   │   ├── login/page.tsx         # Login de usuarios
│   │   │   └── registro/page.tsx      # Registro de nuevos clientes
│   │   ├── admin/                      # Panel de administración
│   │   │   ├── page.tsx               # Dashboard admin
│   │   │   ├── productos/page.tsx     # Gestión de productos
│   │   │   ├── clientes/page.tsx      # Gestión de clientes
│   │   │   └── compras/page.tsx       # Historial de compras
│   │   ├── cliente/tienda/page.tsx    # Tienda para clientes
│   │   ├── carrito/                    # Carrito de compras
│   │   ├── mis-compras/page.tsx       # Historial de compras del cliente
│   │   └── perfil/page.tsx            # Perfil del usuario
│   │
│   ├── lib/             # Utilidades y configuración
│   │   ├── api-client.ts              # Cliente HTTP para API
│   │   ├── types.ts                   # Tipos TypeScript
│   │   └── utils.ts                   # Funciones auxiliares
│   │
│   ├── components/      # Componentes reutilizables
│   ├── contexts/        # Contextos de React (autenticación, carrito)
│   ├── hooks/          # Hooks personalizados
│   └── proxy.ts        # Configuración de proxy de Next.js
│
└── BD/                 # Scripts de base de datos
    ├── config/         # Configuración de BD
    ├── models/         # Definición de modelos
    ├── seed/          # Scripts de datos iniciales
    ├── triggers/      # Triggers de BD
    └── utils/         # Utilidades de BD
```

---

## 🔧 Backend (Flask)

### Arquitectura Principal

**Archivo:** `Backend/main.py`

#### 1. **Inicialización**
- Crea la aplicación Flask
- Configura CORS para permitir peticiones del frontend
- Inicializa la base de datos con tablas y datos iniciales

#### 2. **Tablas de Base de Datos**

```sql
-- Usuarios (admin y clientes)
users: id, email, password (hashed), nombre, rol

-- Información de clientes
clientes: id, cedula, nombre, apellidos, email, celular, direccion, created_at

-- Catálogo de productos (30 items)
productos: id, nombre, tipo_producto, cantidad, precio, imagen_url, created_at, updated_at

-- Historial de compras
compras: id, cliente_id, cliente_nombre, total, productos_json, created_at
```

#### 3. **Endpoints API**

**Autenticación:**
- `POST /api/auth/login` - Inicia sesión (retorna token y datos del usuario)
- `POST /api/auth/register` - Registra nuevo cliente

**Productos:**
- `GET /api/productos` - Lista todos los productos (filtros: tipo, buscar)
- `GET /api/productos/tipos` - Lista tipos de productos disponibles
- `GET /api/cliente/productos` - Productos disponibles para compra

**Compras:**
- `POST /api/cliente/comprar` - Procesa una compra
- `GET /api/cliente/compras/{id}` - Historial de compras del cliente

**Admin:**
- `GET /api/admin/productos` - Lista productos (admin)
- `POST /api/admin/productos` - Agregar producto
- `PUT /api/admin/productos/{id}` - Actualizar producto
- `DELETE /api/admin/productos/{id}` - Eliminar producto
- `GET /api/admin/clientes` - Lista de clientes
- `DELETE /api/admin/clientes/{id}` - Eliminar cliente
- `GET /api/admin/compras` - Todas las compras

**Perfil:**
- `GET /api/user/profile/{id}` - Obtener perfil
- `PUT /api/user/profile/{id}` - Actualizar perfil

#### 4. **Seguridad**
- Contraseñas hasheadas con bcrypt
- Validación de stock antes de compra
- CORS restringido a dominios autorizados
- Manejo de errores con try-catch

#### 5. **Datos Iniciales**
- 1 usuario admin (admin@tienda.com / admin123)
- 30 productos: 18 alimentos + 12 de limpieza

---

## 🎨 Frontend (Next.js + React)

### Estructura de Componentes

**Archivo:** `Fronted/lib/api-client.ts`

Cliente HTTP centralizado que encapsula todas las llamadas a la API:
- Gestión de productos
- Autenticación y registro
- Compras y carrito
- Perfil de usuario

**Tipos TypeScript:** `Fronted/lib/types.ts`

Define interfaces para:
- Usuario
- Producto
- Carrito
- Compra

### Flujos Principales

#### 1. **Flujo de Login**
```
LoginForm → api.login() → backend /auth/login → 
  Guardar token en localStorage → Redirigir a dashboard
```

#### 2. **Flujo de Registro**
```
RegistroForm → api.register() → backend /auth/register →
  Crear usuario + cliente → Redirigir a login
```

#### 3. **Flujo de Compra**
```
ProductCard → AgregarAlCarrito → Carrito → ConfirmarCompra →
  api.comprar() → backend /cliente/comprar →
  Reducir stock → Crear compra → Mostrar confirmación
```

#### 4. **Panel Admin**
```
Dashboard Admin → Gestionar:
  - Productos (crear, editar, eliminar)
  - Clientes (listar, eliminar)
  - Compras (ver historial)
```

### Contextos (State Management)

**AuthContext:** Maneja autenticación global
- Usuario actual
- Token JWT
- Funciones login/logout/register

**CartContext:** Maneja carrito de compras
- Items en carrito
- Funciones agregar/eliminar/limpiar

---

## 🛠 Configuración y Despliegue

### Desarrollo Local

```bash
# Backend
cd Backend
python main.py  # Corre en http://localhost:8000

# Frontend
cd Fronted
npm install
npm run dev    # Corre en http://localhost:3000
```

### Variables de Entorno

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend** (variables de sistema):
```
PORT=8000
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app
```

### Despliegue

**Backend (Heroku):**
```bash
heroku create nombre-api
heroku config:set SMTP_USER=...
git push heroku main
```

**Frontend (Vercel):**
```bash
vercel deploy
```

---

## 📊 Base de Datos

### Productos (30 items)

**Alimentos (18):**
Arroz, Frijoles, Aceite, Leche, Huevos, Pan, Café, Azúcar Blanca, Sal, Pasta, Atún, Tomates, Cebolla, Ajo, Harina, Azúcar Morena, Chocolate, Leche Condensada

**Limpieza (12):**
Detergente, Lavaloza, Desinfectante, Blanqueador, Jabón de Baño, Papel Higiénico, Esponja, Suavizante, Limpiavidrios, Bolsas Basura, Desengrasante, Ambientador

### Flujo de Datos

```
Cliente → Frontend → API Backend → SQLite
  ↓
  Busca Producto
  ↓
  Agrega al Carrito
  ↓
  Realiza Compra
  ↓
  Backend actualiza stock
  ↓
  Crea registro en tabla compras
  ↓
  Retorna confirmación
```

---

## 🔐 Seguridad

1. **Autenticación:** Contraseñas hasheadas con bcrypt
2. **CORS:** Solo dominios autorizados
3. **Validación:** Stock y datos en backend
4. **Transacciones:** Rollback en errores de compra
5. **Manejo de Errores:** Try-catch en operaciones críticas

---

## 📝 Credenciales por Defecto

**Admin:**
- Email: `admin@tienda.com`
- Contraseña: `admin123`

---

## 🚀 Stack Tecnológico

**Backend:**
- Flask 3.0.0
- SQLite
- Werkzeug (bcrypt)
- Flask-CORS

**Frontend:**
- Next.js 16.2.4
- React 19
- TypeScript
- Tailwind CSS

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs del Backend: `python main.py`
2. Revisar consola del navegador (F12)
3. Verificar `.env.local` en Frontend
4. Asegurar que Backend esté corriendo en puerto 8000
