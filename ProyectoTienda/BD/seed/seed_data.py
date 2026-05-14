"""BD/seed/seed_data.py

Carga de datos de ejemplo:
- 1 administrador (admin/admin123 hasheada)
- 3 productos
- 2 clientes

Los usuarios de clientes y sus contraseñas se generan automáticamente.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from BD.config.mysql import DATABASE_URL
from BD.models.administrador import Administrador
from BD.models.clientes import Cliente
from BD.models.productos import Producto
from BD.models.base import Base
from BD.utils.security import generate_username, hash_password_sha256


def seed_example_data(engine, with_admin: bool = True) -> None:
    with Session(engine) as session:
        # Productos (seed mínimo; compras/detalles no se insertan en este proyecto)
        productos = [
            Producto(id=1, nombre="Gaseosa Cola 350ml", tipo_producto="bebida", cantidad=50, precio=3500),
            Producto(id=2, nombre="Detergente 1kg", tipo_producto="aseo", cantidad=30, precio=9000),
            Producto(id=3, nombre="Arroz 1kg", tipo_producto="comida", cantidad=80, precio=5500),
        ]

        session.add_all(productos)


        # Clientes
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

        clientes = []
        for c in seed_clientes:
            usuario = generate_username(c["nombre"], c["apellidos"]) + "_" + c["cedula"][-4:]
            password_plain = "TempPass!" + c["cedula"][-3:]
            clientes.append(
                Cliente(
                    user_id=f"seed_user_{c['cedula']}",
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
        session.add_all(clientes)

        # Administrador
        if with_admin:
            admin = Administrador(id_admin=1, usuario="admin", contraseña=hash_password_sha256("admin123"))
            session.add(admin)

        session.commit()

