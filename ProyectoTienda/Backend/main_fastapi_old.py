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
import json
from passlib.context import CryptContext

# SQLAlchemy imports
from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base

# --- PASSWORD HASHING ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- CONFIGURACION DB ---
DATABASE_URL = "sqlite:///./tienda.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELOS SQLALCHEMY ---

class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    nombre = Column(String)
    rol = Column(String) # 'admin' o 'cliente'

class ClienteDB(Base):
    __tablename__ = "clientes"
    id = Column(String, primary_key=True, index=True) # Linked to UserDB.id
    cedula = Column(String, unique=True, index=True)
    nombre = Column(String)
    apellidos = Column(String)
    email = Column(String)
    celular = Column(String)
    direccion = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductoDB(Base):
    __tablename__ = "productos"
    id = Column(String, primary_key=True, index=True)
    nombre = Column(String)
    tipo_producto = Column(String)
    cantidad = Column(Integer)
    precio = Column(Float)
    imagen_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CompraDB(Base):
    __tablename__ = "compras"
    id = Column(String, primary_key=True, index=True)
    cliente_id = Column(String, ForeignKey("users.id"))
    cliente_nombre = Column(String) # Denormalizado para facilitar visualizacion
    total = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Almacenamos productos como JSON string para simplificar
    productos_json = Column(Text) 

# Crear tablas
Base.metadata.create_all(bind=engine)

# --- DEPENDENCIAS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- INICIALIZACION DATOS ---
def init_db():
    db = SessionLocal()
    admin_exist = db.query(UserDB).filter(UserDB.email == "admin@tienda.com").first()
    if not admin_exist:
        admin = UserDB(
            id="admin-id",
            email="admin@tienda.com",
            password=hash_password("admin123"),
            nombre="Administrador",
            rol="admin"
        )
        db.add(admin)
        
        # Productos iniciales
        prods = [
            ProductoDB(id="1", nombre="Camiseta Deportiva", precio=25000, cantidad=50, tipo_producto="Ropa", imagen_url="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"),
            ProductoDB(id="2", nombre="Zapatillas Correr", precio=89000, cantidad=20, tipo_producto="Calzado", imagen_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"),
            ProductoDB(id="3", nombre="Balón de Fútbol", precio=45000, cantidad=0, tipo_producto="Deportes", imagen_url="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500"),
        ]
        for p in prods:
            db.add(p)
        
        db.commit()
    db.close()

init_db()

# --- APP FASTAPI ---
app = FastAPI(title="TuTiendaVirtual API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURACION SMTP ---
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "tu-correo@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "tu-contraseña-app")

# --- MODELOS PYDANTIC ---

class UserSchema(BaseModel):
    id: str
    email: str
    nombre: str
    rol: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ClienteSchema(BaseModel):
    id: Optional[str] = None
    cedula: str
    nombre: str
    apellidos: str
    email: EmailStr
    celular: str
    direccion: str
    created_at: Optional[datetime] = None

class ProductoSchema(BaseModel):
    id: str
    nombre: str
    tipo_producto: str
    cantidad: int
    precio: float
    imagen_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CartItem(BaseModel):
    id_producto: str
    cantidad: int

class BuyRequest(BaseModel):
    id_cliente: str
    productos: List[CartItem]

class CompraSchema(BaseModel):
    id: str
    cliente_id: str
    cliente_nombre: str
    total: float
    productos: List[dict]
    created_at: datetime

# --- FUNCION ENVIO CORREO ---

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        if "@gmail.com" not in SMTP_USER or "contraseña" in SMTP_PASS:
            print(f"!!! SALTANDO ENVIO REAL (Faltan credenciales SMTP) !!!")
            print(f"Para: {to_email}\nAsunto: {subject}\nCuerpo:\n{body}")
            return

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Error enviando correo: {e}")

# --- ENDPOINTS ---

@app.post("/api/auth/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == req.email).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {
        "id": user.id,
        "email": user.email,
        "nombre": user.nombre,
        "rol": user.rol,
        "token": "mock-jwt-token-" + str(uuid.uuid4())
    }

@app.post("/api/auth/register")
async def register(req: ClienteSchema, db: Session = Depends(get_db)):
    user_exists = db.query(UserDB).filter(UserDB.email == req.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    user_id = str(uuid.uuid4())
    auto_password = f"user.{req.cedula}"

    new_user = UserDB(
        id=user_id,
        email=req.email,
        password=hash_password(auto_password),
        nombre=req.nombre,
        rol="cliente"
    )

    new_cliente = ClienteDB(
        id=user_id,
        cedula=req.cedula,
        nombre=req.nombre,
        apellidos=req.apellidos,
        email=req.email,
        celular=req.celular,
        direccion=req.direccion
    )

    db.add(new_user)
    db.add(new_cliente)
    db.commit()

    send_email(
        req.email,
        "Tus credenciales de TuTiendaVirtual",
        f"Hola {req.nombre},\n\nTu cuenta ha sido creada. Puedes ingresar con:\nUsuario: {req.email}\nContraseña: {auto_password}"
    )

    return {"message": "Registro exitoso", "debug_password_info": f"Contraseña: {auto_password}"}

@app.get("/api/productos")
async def get_productos(tipo: Optional[str] = None, buscar: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProductoDB)
    if tipo:
        query = query.filter(ProductoDB.tipo_producto.ilike(tipo))
    if buscar:
        query = query.filter(ProductoDB.nombre.ilike(f"%{buscar}%"))
    return query.all()

@app.get("/api/productos/tipos")
async def get_tipos(db: Session = Depends(get_db)):
    tipos = db.query(ProductoDB.tipo_producto).distinct().all()
    return [t[0] for t in tipos]

@app.get("/api/cliente/productos")
async def get_cliente_productos(db: Session = Depends(get_db)):
    return db.query(ProductoDB).all()

@app.post("/api/cliente/comprar")
async def store_buy(req: BuyRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == req.id_cliente).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    items_comprados = []
    total_precio = 0
    
    try:
        for item in req.productos:
            producto = db.query(ProductoDB).filter(ProductoDB.id == item.id_producto).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
            
            if producto.cantidad < item.cantidad:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {producto.nombre}")
            
            producto.cantidad -= item.cantidad
            subtotal = producto.precio * item.cantidad
            total_precio += subtotal
            
            items_comprados.append({
                "id": producto.id,
                "nombre": producto.nombre,
                "cantidad": item.cantidad,
                "precio": producto.precio,
                "subtotal": subtotal
            })
            
        nueva_compra = CompraDB(
            id=str(uuid.uuid4()),
            cliente_id=req.id_cliente,
            cliente_nombre=user.nombre,
            total=total_precio,
            productos_json=json.dumps(items_comprados)
        )
        db.add(nueva_compra)
        db.commit()
        
        return {"success": True, "id_compra": nueva_compra.id}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cliente/compras/{id}")
async def get_cliente_compras(id: str, db: Session = Depends(get_db)):
    compras = db.query(CompraDB).filter(CompraDB.cliente_id == id).all()
    res = []
    for c in compras:
        res.append({
            "id": c.id,
            "cliente_id": c.cliente_id,
            "cliente_nombre": c.cliente_nombre,
            "total": c.total,
            "productos": json.loads(c.productos_json),
            "created_at": c.created_at
        })
    return res

# --- ADMIN ENDPOINTS ---

@app.get("/api/admin/productos")
async def admin_get_productos(db: Session = Depends(get_db)):
    return db.query(ProductoDB).all()

@app.post("/api/admin/productos")
async def admin_add_producto(prod: ProductoSchema, db: Session = Depends(get_db)):
    new_prod = ProductoDB(**prod.dict(exclude={"created_at", "updated_at"}))
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@app.put("/api/admin/productos/{id}")
async def admin_update_producto(id: str, prod: ProductoSchema, db: Session = Depends(get_db)):
    db_prod = db.query(ProductoDB).filter(ProductoDB.id == id).first()
    if not db_prod: raise HTTPException(status_code=404, detail="No encontrado")
    
    for key, value in prod.dict(exclude={"id", "created_at", "updated_at"}).items():
        setattr(db_prod, key, value)
    
    db.commit()
    return db_prod

@app.delete("/api/admin/productos/{id}")
async def admin_delete_producto(id: str, db: Session = Depends(get_db)):
    db_prod = db.query(ProductoDB).filter(ProductoDB.id == id).first()
    if db_prod:
        db.delete(db_prod)
        db.commit()
    return {"message": "Eliminado"}

@app.get("/api/admin/clientes")
async def admin_get_clientes(db: Session = Depends(get_db)):
    return db.query(ClienteDB).all()

@app.delete("/api/admin/clientes/{id}")
async def admin_delete_cliente(id: str, db: Session = Depends(get_db)):
    cliente = db.query(ClienteDB).filter(ClienteDB.id == id).first()
    user = db.query(UserDB).filter(UserDB.id == id).first()
    if cliente: db.delete(cliente)
    if user: db.delete(user)
    db.commit()
    return {"message": "Eliminado"}

@app.get("/api/admin/compras")
async def admin_get_compras(db: Session = Depends(get_db)):
    compras = db.query(CompraDB).all()
    res = []
    for c in compras:
        res.append({
            "id": c.id,
            "cliente_id": c.cliente_id,
            "cliente_nombre": c.cliente_nombre,
            "total": c.total,
            "productos": json.loads(c.productos_json),
            "created_at": c.created_at
        })
    return res

class ProfileUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    cedula: Optional[str] = None
    apellidos: Optional[str] = None
    celular: Optional[str] = None
    direccion: Optional[str] = None

@app.get("/api/user/profile/{id}")
async def get_profile(id: str, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    res = {
        "id": user.id,
        "email": user.email,
        "nombre": user.nombre,
        "rol": user.rol,
    }
    
    if user.rol == "cliente":
        cliente = db.query(ClienteDB).filter(ClienteDB.id == id).first()
        if cliente:
            res.update({
                "cedula": cliente.cedula,
                "apellidos": cliente.apellidos,
                "celular": cliente.celular,
                "direccion": cliente.direccion
            })
            
    return res

@app.put("/api/user/profile/{id}")
async def update_profile(id: str, req: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if req.nombre:
        user.nombre = req.nombre
    if req.email:
        user.email = req.email
    if req.password:
        user.password = hash_password(req.password)

    if user.rol == "cliente":
        cliente = db.query(ClienteDB).filter(ClienteDB.id == id).first()
        if cliente:
            if req.nombre:
                cliente.nombre = req.nombre
            if req.email:
                cliente.email = req.email
            if req.cedula:
                cliente.cedula = req.cedula
            if req.apellidos:
                cliente.apellidos = req.apellidos
            if req.celular:
                cliente.celular = req.celular
            if req.direccion:
                cliente.direccion = req.direccion

    db.commit()
    return {"message": "Perfil actualizado correctamente"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

