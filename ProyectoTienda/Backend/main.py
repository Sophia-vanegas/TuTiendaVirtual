from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid
import json
import sqlite3
import os

# Inicializa la aplicación Flask
app = Flask(__name__)

# Configura CORS para permitir solicitudes desde el frontend local y producción
CORS(app,
     origins=["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True)

# Ruta de la base de datos SQLite
DATABASE = "tienda.db"

def get_db():
    """Establece conexión con la base de datos SQLite"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa las tablas de la base de datos y carga datos iniciales"""
    conn = get_db()
    c = conn.cursor()

    # Tabla de usuarios (admin y clientes)
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL,
        rol TEXT NOT NULL
    )''')

    # Tabla de clientes con información adicional
    c.execute('''CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        cedula TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        email TEXT NOT NULL,
        celular TEXT NOT NULL,
        direccion TEXT NOT NULL,
        created_at TEXT NOT NULL
    )''')

    # Tabla de productos del supermercado
    c.execute('''CREATE TABLE IF NOT EXISTS productos (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        tipo_producto TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        precio REAL NOT NULL,
        imagen_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )''')

    # Tabla de compras realizadas
    c.execute('''CREATE TABLE IF NOT EXISTS compras (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        cliente_nombre TEXT NOT NULL,
        total REAL NOT NULL,
        productos_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(cliente_id) REFERENCES users(id)
    )''')

    conn.commit()

    # Crear admin si no existe
    admin = c.execute("SELECT * FROM users WHERE email = ?", ("admin@tienda.com",)).fetchone()
    if not admin:
        admin_id = str(uuid.uuid4())
        c.execute('''INSERT INTO users VALUES (?, ?, ?, ?, ?)''',
                  (admin_id, "admin@tienda.com", generate_password_hash("admin123"), "Administrador", "admin"))

        # Productos de supermercado: Alimentos y Limpieza (30 productos)
        prods = [
            # ALIMENTOS (18 productos)
            ("1", "Arroz Blanco Premium (1kg)", "Alimentos", 100, 4500, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80"),
            ("2", "Frijoles Rojos (1kg)", "Alimentos", 80, 8200, "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500&q=80"),
            ("3", "Aceite Vegetal (1L)", "Alimentos", 60, 12500, "https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?w=500&q=80"),
            ("4", "Leche Entera Larga Vida (1L)", "Alimentos", 90, 4200, "https://images.unsplash.com/photo-1563636619-e910ef493996?w=500&q=80"),
            ("5", "Huevos AA (Panal x30)", "Alimentos", 50, 18000, "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80"),
            ("6", "Pan Tajado Familiar", "Alimentos", 40, 5500, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80"),
            ("7", "Cafe Molido Selecto (500g)", "Alimentos", 70, 15000, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80"),
            ("8", "Azucar Blanca (1kg)", "Alimentos", 120, 3800, "https://images.unsplash.com/photo-1622484211148-713284f67645?w=500&q=80"),
            ("9", "Sal Marina (1kg)", "Alimentos", 100, 2200, "https://images.unsplash.com/photo-1626131731323-e6711bb619fe?w=500&q=80"),
            ("10", "Pasta Espagueti (500g)", "Alimentos", 110, 3500, "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80"),
            ("11", "Atun Enlatado (170g)", "Alimentos", 75, 6500, "https://images.unsplash.com/photo-1631193945979-e5db66f2a84f?w=500&q=80"),
            ("12", "Tomates Frescos (1kg)", "Alimentos", 60, 8000, "https://images.unsplash.com/photo-1592841494900-055cc937943a?w=500&q=80"),
            ("13", "Cebolla Blanca (1kg)", "Alimentos", 80, 3500, "https://images.unsplash.com/photo-1585518419759-55b725a5b65f?w=500&q=80"),
            ("14", "Ajo Fresco (250g)", "Alimentos", 50, 9000, "https://images.unsplash.com/photo-1577003834202-eb4d7206e088?w=500&q=80"),
            ("15", "Harina de Trigo (1kg)", "Alimentos", 95, 4200, "https://images.unsplash.com/photo-1585707572537-b6237b2ecbcd?w=500&q=80"),
            ("16", "Azucar Morena (1kg)", "Alimentos", 60, 5500, "https://images.unsplash.com/photo-1599788690732-fc91cadbd5c3?w=500&q=80"),
            ("17", "Chocolate en Polvo (200g)", "Alimentos", 45, 8500, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80"),
            ("18", "Leche Condensada (397g)", "Alimentos", 70, 6800, "https://images.unsplash.com/photo-1550521323-9ca0ba017d26?w=500&q=80"),
            # LIMPIEZA (12 productos)
            ("19", "Detergente en Polvo (2kg)", "Limpieza", 80, 15800, "https://images.unsplash.com/photo-1584622781564-1d9876a13d00?w=500&q=80"),
            ("20", "Lavaloza Liquido Limon (500ml)", "Limpieza", 100, 6500, "https://images.unsplash.com/photo-1603530635183-0599a80509a2?w=500&q=80"),
            ("21", "Desinfectante Multiusos (1L)", "Limpieza", 75, 7200, "https://images.unsplash.com/photo-1584309662032-3562a35b6658?w=500&q=80"),
            ("22", "Blanqueador Cloro (1L)", "Limpieza", 90, 4500, "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80"),
            ("23", "Jabon de Bano Cremoso (x3)", "Limpieza", 60, 9500, "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500&q=80"),
            ("24", "Papel Higienico Soft (8 rollos)", "Limpieza", 85, 14000, "https://images.unsplash.com/photo-1591047990981-50e86b1ca516?w=500&q=80"),
            ("25", "Esponja de Cocina Doble Uso (x3)", "Limpieza", 120, 3000, "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80"),
            ("26", "Suavizante de Ropas (1L)", "Limpieza", 65, 11000, "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&q=80"),
            ("27", "Limpiavidrios (500ml)", "Limpieza", 55, 5800, "https://images.unsplash.com/photo-1584840099259-02c8c8c2df0d?w=500&q=80"),
            ("28", "Bolsas de Basura Negras (x10)", "Limpieza", 100, 6000, "https://images.unsplash.com/photo-1591193520257-c030ea854088?w=500&q=80"),
            ("29", "Desengrasante Cocina (500ml)", "Limpieza", 70, 8500, "https://images.unsplash.com/photo-1585329267302-97382be59b6d?w=500&q=80"),
            ("30", "Ambientador en Spray (300ml)", "Limpieza", 80, 4800, "https://images.unsplash.com/photo-1589985643096-92268e22bf00?w=500&q=80"),
        ]

        for id, nombre, tipo, cant, precio, img in prods:
            now = datetime.utcnow().isoformat()
            c.execute('''INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                      (id, nombre, tipo, cant, precio, img, now, now))

        conn.commit()

    conn.close()

init_db()

# --- MANEJADOR GLOBAL PARA PREFLIGHT ---
@app.before_request
def handle_preflight():
    """Maneja las solicitudes OPTIONS (preflight CORS) antes de procesar la solicitud real"""
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

# --- ENDPOINTS ---

@app.route("/api/auth/login", methods=["POST"])
def login():
    """Autentica un usuario comparando email y contraseña hasheada"""
    data = request.json
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (data['email'],)).fetchone()
    conn.close()

    # Verifica que el usuario existe y la contraseña es correcta (hasheada con bcrypt)
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({"detail": "Credenciales incorrectas"}), 401

    return jsonify({
        "id": user['id'],
        "email": user['email'],
        "nombre": user['nombre'],
        "rol": user['rol'],
        "token": f"mock-jwt-token-{uuid.uuid4()}"
    })

@app.route("/api/auth/register", methods=["POST"])
def register():
    """Registra un nuevo cliente en el sistema"""
    data = request.json
    conn = get_db()
    c = conn.cursor()

    # Verifica si el email ya está registrado
    user_exists = c.execute("SELECT * FROM users WHERE email = ?", (data['email'],)).fetchone()
    if user_exists:
        conn.close()
        return jsonify({"detail": "El correo ya está registrado"}), 400

    user_id = str(uuid.uuid4())
    auto_password = f"user.{data['cedula']}"
    now = datetime.utcnow().isoformat()

    # Crea usuario con contraseña hasheada
    c.execute('''INSERT INTO users VALUES (?, ?, ?, ?, ?)''',
              (user_id, data['email'], generate_password_hash(auto_password), data['nombre'], "cliente"))

    # Crea registro de cliente con información adicional
    c.execute('''INSERT INTO clientes VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (user_id, data['cedula'], data['nombre'], data['apellidos'], data['email'],
               data['celular'], data['direccion'], now))

    conn.commit()
    conn.close()

    return jsonify({"message": "Registro exitoso", "debug_password_info": f"Contraseña: {auto_password}"})

@app.route("/api/productos", methods=["GET"])
def get_productos():
    """Obtiene todos los productos, con opción de filtrar por tipo o buscar por nombre"""
    tipo = request.args.get('tipo')
    buscar = request.args.get('buscar')

    conn = get_db()
    query = "SELECT * FROM productos WHERE 1=1"
    params = []

    # Filtra por tipo de producto si se proporciona
    if tipo:
        query += " AND tipo_producto LIKE ?"
        params.append(f"%{tipo}%")
    # Busca en el nombre del producto si se proporciona un término
    if buscar:
        query += " AND nombre LIKE ?"
        params.append(f"%{buscar}%")

    productos = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify([dict(p) for p in productos])

@app.route("/api/productos/tipos", methods=["GET"])
def get_tipos():
    """Obtiene todos los tipos de productos disponibles (categorías)"""
    conn = get_db()
    tipos = conn.execute("SELECT DISTINCT tipo_producto FROM productos").fetchall()
    conn.close()
    return jsonify([t[0] for t in tipos])

@app.route("/api/cliente/productos", methods=["GET"])
def get_cliente_productos():
    """Obtiene todos los productos disponibles para los clientes"""
    conn = get_db()
    productos = conn.execute("SELECT * FROM productos").fetchall()
    conn.close()
    return jsonify([dict(p) for p in productos])

@app.route("/api/cliente/comprar", methods=["POST"])
def store_buy():
    """Procesa una compra: actualiza el stock y crea un registro de compra"""
    data = request.json
    conn = get_db()
    c = conn.cursor()

    # Verifica que el cliente existe
    user = c.execute("SELECT * FROM users WHERE id = ?", (data['id_cliente'],)).fetchone()
    if not user:
        conn.close()
        return jsonify({"detail": "Usuario no encontrado"}), 404

    items_comprados = []
    total_precio = 0

    try:
        # Procesa cada producto en la compra
        for item in data['productos']:
            producto = c.execute("SELECT * FROM productos WHERE id = ?", (item['id_producto'],)).fetchone()
            if not producto:
                raise Exception(f"Producto {item['id_producto']} no encontrado")

            # Verifica que hay suficiente stock
            if producto['cantidad'] < item['cantidad']:
                raise Exception(f"Stock insuficiente para {producto['nombre']}")

            # Reduce el stock del producto
            c.execute("UPDATE productos SET cantidad = cantidad - ? WHERE id = ?",
                     (item['cantidad'], item['id_producto']))

            subtotal = producto['precio'] * item['cantidad']
            total_precio += subtotal

            items_comprados.append({
                "id": producto['id'],
                "nombre": producto['nombre'],
                "cantidad": item['cantidad'],
                "precio": producto['precio'],
                "subtotal": subtotal
            })

        # Crea registro de la compra
        compra_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        c.execute('''INSERT INTO compras VALUES (?, ?, ?, ?, ?, ?)''',
                  (compra_id, data['id_cliente'], user['nombre'], total_precio, json.dumps(items_comprados), now))

        conn.commit()
        conn.close()

        return jsonify({"success": True, "id_compra": compra_id})
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"detail": str(e)}), 500

@app.route("/api/cliente/compras/<id>", methods=["GET"])
def get_cliente_compras(id):
    """Obtiene todas las compras de un cliente específico"""
    conn = get_db()
    compras = conn.execute("SELECT * FROM compras WHERE cliente_id = ?", (id,)).fetchall()
    conn.close()

    res = []
    for c in compras:
        res.append({
            "id": c['id'],
            "cliente_id": c['cliente_id'],
            "cliente_nombre": c['cliente_nombre'],
            "total": c['total'],
            "productos": json.loads(c['productos_json']),
            "created_at": c['created_at']
        })
    return jsonify(res)

@app.route("/api/admin/productos", methods=["GET"])
def admin_get_productos():
    """ADMIN: Obtiene todos los productos para administración"""
    conn = get_db()
    productos = conn.execute("SELECT * FROM productos").fetchall()
    conn.close()
    return jsonify([dict(p) for p in productos])

@app.route("/api/admin/productos", methods=["POST"])
def admin_add_producto():
    """ADMIN: Agrega un nuevo producto al catálogo"""
    data = request.json
    conn = get_db()
    c = conn.cursor()

    now = datetime.utcnow().isoformat()
    prod_id = str(uuid.uuid4())

    c.execute('''INSERT INTO productos VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (prod_id, data['nombre'], data['tipo_producto'], data['cantidad'],
               data['precio'], data.get('imagen_url'), now, now))

    conn.commit()
    conn.close()

    return jsonify({"id": prod_id, **data})

@app.route("/api/admin/productos/<id>", methods=["PUT"])
def admin_update_producto(id):
    """ADMIN: Actualiza información de un producto existente"""
    data = request.json
    conn = get_db()
    c = conn.cursor()

    now = datetime.utcnow().isoformat()
    c.execute('''UPDATE productos SET nombre=?, tipo_producto=?, cantidad=?, precio=?,
                 imagen_url=?, updated_at=? WHERE id=?''',
              (data['nombre'], data['tipo_producto'], data['cantidad'],
               data['precio'], data.get('imagen_url'), now, id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Actualizado"})

@app.route("/api/admin/productos/<id>", methods=["DELETE"])
def admin_delete_producto(id):
    """ADMIN: Elimina un producto del catálogo"""
    conn = get_db()
    conn.execute("DELETE FROM productos WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Eliminado"})

@app.route("/api/admin/clientes", methods=["GET"])
def admin_get_clientes():
    """ADMIN: Obtiene lista de todos los clientes registrados"""
    conn = get_db()
    clientes = conn.execute("SELECT * FROM clientes").fetchall()
    conn.close()
    return jsonify([dict(c) for c in clientes])

@app.route("/api/admin/clientes/<id>", methods=["DELETE"])
def admin_delete_cliente(id):
    """ADMIN: Elimina un cliente y su usuario asociado"""
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM clientes WHERE id = ?", (id,))
    c.execute("DELETE FROM users WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Eliminado"})

@app.route("/api/admin/compras", methods=["GET"])
def admin_get_compras():
    """ADMIN: Obtiene todas las compras realizadas en el sistema"""
    conn = get_db()
    compras = conn.execute("SELECT * FROM compras").fetchall()
    conn.close()

    res = []
    for c in compras:
        res.append({
            "id": c['id'],
            "cliente_id": c['cliente_id'],
            "cliente_nombre": c['cliente_nombre'],
            "total": c['total'],
            "productos": json.loads(c['productos_json']),
            "created_at": c['created_at']
        })
    return jsonify(res)

@app.route("/api/user/profile/<id>", methods=["GET"])
def get_profile(id):
    """Obtiene el perfil de un usuario (usuario y datos de cliente si aplica)"""
    conn = get_db()
    c = conn.cursor()

    user = c.execute("SELECT * FROM users WHERE id = ?", (id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"detail": "Usuario no encontrado"}), 404

    res = {
        "id": user['id'],
        "email": user['email'],
        "nombre": user['nombre'],
        "rol": user['rol'],
    }

    # Si el usuario es cliente, agrega la información adicional
    if user['rol'] == "cliente":
        cliente = c.execute("SELECT * FROM clientes WHERE id = ?", (id,)).fetchone()
        if cliente:
            res.update({
                "cedula": cliente['cedula'],
                "apellidos": cliente['apellidos'],
                "celular": cliente['celular'],
                "direccion": cliente['direccion']
            })

    conn.close()
    return jsonify(res)

@app.route("/api/user/profile/<id>", methods=["PUT"])
def update_profile(id):
    """Actualiza el perfil de un usuario (nombre, email, contraseña, datos de cliente)"""
    data = request.json
    conn = get_db()
    c = conn.cursor()

    user = c.execute("SELECT * FROM users WHERE id = ?", (id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"detail": "Usuario no encontrado"}), 404

    # Actualiza información del usuario
    updates = {}
    if 'nombre' in data:
        updates['nombre'] = data['nombre']
    if 'email' in data:
        updates['email'] = data['email']
    if 'password' in data:
        # Hashea la nueva contraseña
        updates['password'] = generate_password_hash(data['password'])

    if updates:
        set_clause = ", ".join([f"{k}=?" for k in updates.keys()])
        values = list(updates.values()) + [id]
        c.execute(f"UPDATE users SET {set_clause} WHERE id=?", values)

    # Actualiza información de cliente si aplica
    if user['rol'] == "cliente":
        cliente_updates = {}
        if 'nombre' in data:
            cliente_updates['nombre'] = data['nombre']
        if 'email' in data:
            cliente_updates['email'] = data['email']
        if 'cedula' in data:
            cliente_updates['cedula'] = data['cedula']
        if 'apellidos' in data:
            cliente_updates['apellidos'] = data['apellidos']
        if 'celular' in data:
            cliente_updates['celular'] = data['celular']
        if 'direccion' in data:
            cliente_updates['direccion'] = data['direccion']

        if cliente_updates:
            set_clause = ", ".join([f"{k}=?" for k in cliente_updates.keys()])
            values = list(cliente_updates.values()) + [id]
            c.execute(f"UPDATE clientes SET {set_clause} WHERE id=?", values)

    conn.commit()
    conn.close()

    return jsonify({"message": "Perfil actualizado correctamente"})

if __name__ == "__main__":
    """Punto de entrada: inicia el servidor Flask en el puerto especificado"""
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
