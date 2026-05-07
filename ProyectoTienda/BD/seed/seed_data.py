"""BD/seed/seed_data.py

Carga de datos de ejemplo:
- 1 administrador (admin/admin123 hasheada)
- 3 productos
- 2 clientes

Los usuarios de clientes y sus contraseñas se generan automáticamente.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from config.mysql import DATABASE_URL


from models.administrador import Administrador
from models.clientes import Cliente
from models.productos import Producto
from models.base import Base
from utils.security import generate_username, hash_password_sha256



def seed_example_data(engine, with_admin: bool = True) -> None:
    with Session(engine) as session:
        # Productos (evitar duplicados si ya existen)
        existing_products = {pid for (pid,) in session.query(Producto.id_producto).all()}
        productos = []
        seed_products = [
            Producto(id_producto=1, nombre="Gaseosa Cola 350ml", tipo_producto="bebida", cantidad=50),
            Producto(id_producto=2, nombre="Detergente 1kg", tipo_producto="aseo", cantidad=30),
            Producto(id_producto=3, nombre="Arroz 1kg", tipo_producto="comida", cantidad=80),
        ]
        for p in seed_products:
            if p.id_producto not in existing_products:
                productos.append(p)
        if productos:
            session.add_all(productos)


        # Clientes (evitar duplicados si ya existen)
        seed_clientes = [
            {
                "cedula": "1234567890",
                "nombre": "Juan",
                "apellidos": "Pérez",
                "email": "juan.perez@example.com",
                "celular": "3001112233",
                "direccion": "Calle 1 #10-20",
            },
            {
                "cedula": "0987654321",
                "nombre": "María",
                "apellidos": "Gómez",
                "email": "maria.gomez@example.com",
                "celular": "3014455667",
                "direccion": "Carrera 5 #20-10",
            },
        ]

        existing_client_cedulas = {
            cedula for (cedula,) in session.query(Cliente.cedula).all()
        }

        clientes = []
        for c in seed_clientes:
            if c["cedula"] in existing_client_cedulas:
                continue
            usuario = generate_username(c["nombre"], c["apellidos"]) + "_" + c["cedula"][-4:]
            password_plain = "TempPass!" + c["cedula"][-3:]
            clientes.append(
                Cliente(
                    cedula=c["cedula"],
                    nombre=c["nombre"],
                    apellidos=c["apellidos"],
                    email=c["email"],
                    celular=c.get("celular"),
                    direccion=c.get("direccion"),
                    usuario=usuario,
                    contraseña=hash_password_sha256(password_plain),
                )
            )

        if clientes:
            session.add_all(clientes)


        # Administrador (evitar duplicados)
        if with_admin:
            existing_admin = session.query(Administrador.id_admin).filter(Administrador.id_admin == 1).first()
            if existing_admin is None:
                admin = Administrador(id_admin=1, usuario="admin", contraseña=hash_password_sha256("admin123"))
                session.add(admin)


        session.commit()

