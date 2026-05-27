from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = FastAPI(title="TuTiendaVirtual API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURACION SMTP (Placeholder - Rellenar con datos reales) ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "tu-correo@gmail.com" # Cambiar por el real
SMTP_PASS = "tu-contraseña-app"  # Cambiar por la real

# --- MODELOS DE DATOS ---

class User(BaseModel):
    id: str
    email: str
    nombre: str
    rol: str

class LoginRequest(BaseModel):
    email: str
    password: str

class Cliente(BaseModel):
    id: Optional[str] = None
    cedula: str
    nombre: str
    apellidos: str
    email: EmailStr
    celular: str
    direccion: str
    created_at: Optional[str] = None

class Producto(BaseModel):
    id: str
    nombre: str
    tipo_producto: str
    cantidad: int
    precio: float
    imagen_url: Optional[str] = None
    created_at: str
    updated_at: str

class CartItem(BaseModel):
    id_producto: str
    cantidad: int

class BuyRequest(BaseModel):
    id_cliente: str
    productos: List[CartItem]

class Compra(BaseModel):
    id: str
    cliente_id: str
    cliente_nombre: str
    total: float
    productos: List[dict]
    created_at: str

# --- BASE DE DATOS FICTICIA ---

users_db = {
    "admin@tienda.com": {
        "id": "admin-id",
        "email": "admin@tienda.com",
        "password": "admin123",
        "nombre": "Administrador",
        "rol": "admin"
    }
}

clientes_db = []
productos_db = [
    {"id": "1", "nombre": "Camiseta Deportiva", "precio": 25000, "cantidad": 50, "tipo_producto": "Ropa", "imagen_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
    {"id": "2", "nombre": "Zapatillas Correr", "precio": 89000, "cantidad": 20, "tipo_producto": "Calzado", "imagen_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
    {"id": "3", "nombre": "Balón de Fútbol", "precio": 45000, "cantidad": 0, "tipo_producto": "Deportes", "imagen_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500", "created_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()},
]
compras_db = []

# --- FUNCION ENVIO CORREO ---

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Solo intenta enviar si no son los valores por defecto
        if "@gmail.com" not in SMTP_USER or "contraseña" in SMTP_PASS:
            print(f"!!! SALTANDO ENVIO REAL (Faltan credenciales SMTP) !!!")
            print(f"Para: {to_email}\nAsunto: {subject}\nCuerpo:\n{body}")
            return

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        print(f"Correo enviado exitosamente a {to_email}")
    except Exception as e:
        print(f"Error enviando correo: {e}")

# --- ENDPOINTS DE AUTENTICACION ---

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    user = users_db.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "nombre": user["nombre"],
        "rol": user["rol"],
        "token": "mock-jwt-token-" + str(uuid.uuid4())
    }

@app.post("/api/auth/register")
async def register(req: Cliente):
    if req.email in users_db:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    user_id = str(uuid.uuid4())
    auto_password = f"user.{req.cedula}" 
    
    new_user = {
        "id": user_id,
        "email": req.email,
        "password": auto_password,
        "nombre": req.nombre,
        "rol": "cliente"
    }
    
    client_dict = req.model_dump()
    client_dict["id"] = user_id
    client_dict["created_at"] = datetime.now().isoformat()
    
    users_db[req.email] = new_user
    clientes_db.append(client_dict)
    
    # Simular envío de correo de registro
    send_email(
        req.email, 
        "Tus credenciales de TuTiendaVirtual", 
        f"Hola {req.nombre},\n\nTu cuenta ha sido creada. Puedes ingresar con:\nUsuario: {req.email}\nContraseña: {auto_password}"
    )
    
    return {
        "message": "Registro exitoso",
        "debug_password_info": f"Tu contraseña es: {auto_password}"
    }

@app.get("/api/productos")
async def get_productos(tipo: Optional[str] = None, buscar: Optional[str] = None):
    results = productos_db
    if tipo:
        results = [p for p in results if p["tipo_producto"].lower() == tipo.lower()]
    if buscar:
        results = [p for p in results if buscar.lower() in p["nombre"].lower()]
    return results

@app.get("/api/productos/tipos")
async def get_tipos():
    return list(set(p["tipo_producto"] for p in productos_db))

# --- ENDPOINTS CLIENTE ---

@app.get("/api/cliente/productos", response_model=List[Producto])
async def get_cliente_productos():
    return productos_db

@app.post("/api/cliente/comprar")
async def store_buy(req: BuyRequest):
    global productos_db # Mover al inicio para evitar SyntaxError
    
    # Buscar cliente
    cliente_nombre = "Usuario"
    to_email = ""
    for c in clientes_db:
        if c["id"] == req.id_cliente:
            cliente_nombre = c["nombre"]
            to_email = c["email"]
            break
    
    if not to_email:
        to_email = req.id_cliente

    items_comprados = []
    total_precio = 0
    
    # Backup para rollback en caso de error
    backup_db = [p.copy() for p in productos_db]
    
    try:
        for item in req.productos:
            producto = next((p for p in productos_db if p["id"] == item.id_producto), None)
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
            
            if producto["cantidad"] < item.cantidad:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {producto['nombre']}")
            
            # Descontar stock
            producto["cantidad"] -= item.cantidad
            total_precio += producto["precio"] * item.cantidad
            items_comprados.append({
                "id": producto["id"],
                "nombre": producto["nombre"],
                "cantidad": item.cantidad,
                "precio": producto["precio"]
            })
            
        nueva_compra = {
            "id": str(uuid.uuid4()),
            "cliente_id": req.id_cliente,
            "cliente_nombre": cliente_nombre,
            "total": total_precio,
            "productos": items_comprados,
            "created_at": datetime.now().isoformat()
        }
        compras_db.append(nueva_compra)
        
        productos_str = "\n".join([f"- {i['cantidad']} x {i['nombre']} (${i['precio']})" for i in items_comprados])
        cuerpo_correo = f"""
Hola {cliente_nombre},

Tu compra ha sido realizada con éxito.

Productos comprados:
{productos_str}

Total: ${total_precio}

Fecha: {nueva_compra['created_at']}
Número de compra: #{nueva_compra['id'][:8].upper()}

Gracias por tu compra.
Saludos, Tu Tienda de Barrio
"""
        send_email(to_email, "Confirmación de compra - Tu Tienda de Barrio", cuerpo_correo)
        
        return {
            "success": True,
            "mensaje": "Compra realizada con éxito",
            "id_compra": nueva_compra["id"]
        }
        
    except Exception as e:
        productos_db = backup_db
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINTS ADMINISTRADOR (CRUD PRODUCTOS) ---

@app.get("/api/admin/productos", response_model=List[Producto])
async def admin_get_productos():
    return productos_db

@app.post("/api/admin/productos")
async def admin_add_producto(prod: Producto):
    productos_db.append(prod.model_dump())
    return prod

@app.put("/api/admin/productos/{id}")
async def admin_update_producto(id: str, prod: Producto):
    for i, p in enumerate(productos_db):
        if p["id"] == id:
            productos_db[i] = prod.model_dump()
            return productos_db[i]
    raise HTTPException(status_code=404, detail="Producto no encontrado")

@app.delete("/api/admin/productos/{id}")
async def admin_delete_producto(id: str):
    global productos_db
    productos_db = [p for p in productos_db if p["id"] != id]
    return {"message": "Producto eliminado"}

# --- ENDPOINTS ADMINISTRADOR (CRUD CLIENTES) ---

@app.get("/api/admin/clientes", response_model=List[Cliente])
async def admin_get_clientes():
    return clientes_db

@app.delete("/api/admin/clientes/{id}")
async def admin_delete_cliente(id: str):
    global clientes_db
    clientes_db = [c for c in clientes_db if c["id"] != id]
    return {"message": "Cliente eliminado"}

@app.get("/api/admin/compras", response_model=List[Compra])
async def admin_get_compras():
    return compras_db

@app.get("/api/cliente/compras/{id}", response_model=List[Compra])
async def get_cliente_compras(id: str):
    return [c for c in compras_db if c["cliente_id"] == id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
