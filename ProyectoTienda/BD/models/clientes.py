
"""BD/models/clientes.py

Modelo Cliente compatible con el Frontend.

El Frontend consulta:
- clientes.eq("user_id", user.id).single()

Columnas esperadas:
- id (PK)
- user_id
- cedula, nombre, apellidos, email, celular, direccion
- created_at

Se conservan campos internos (usuario/contraseña) para el flujo actual si aplica.
"""

from __future__ import annotations

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint, Column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, autoincrement=True)


    user_id = String(60)

    cedula = String(20, collation="utf8mb4_0900_ai_ci")
    nombre = String(100)
    apellidos = String(150)
    email = String(150)
    celular = String(30)
    direccion = Text()

    # Campos usados por seed/autenticación local (se conservan)
    usuario = String(60)
    contrasena = String(255)






    created_at = Column(DateTime, default=func.now())


    compras = relationship(
        "Compra", back_populates="cliente", cascade="all, delete-orphan"
    )

    # Mantener constraints; sin embargo, no forzarlas aquí para evitar errores
    # si el esquema/seed no está actualizado aún.
    __table_args__ = ()



