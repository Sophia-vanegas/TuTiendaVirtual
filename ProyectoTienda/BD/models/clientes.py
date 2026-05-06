"""BD/models/clientes.py

Modelo Cliente.

Restricciones:
- cedula es PK y única
- email única
- usuario se genera automáticamente (en seed/app)
- contraseña se almacena hasheada (en seed/app)
"""

from __future__ import annotations

from sqlalchemy import DateTime, String, Text, UniqueConstraint, PrimaryKeyConstraint, Column
from sqlalchemy import func
from sqlalchemy.orm import relationship

from .base import Base


class Cliente(Base):
    __tablename__ = "clientes"

    cedula = String(20, collation="utf8mb4_0900_ai_ci")
    nombre = String(100)
    apellidos = String(150)
    email = String(150)
    celular = String(30)
    direccion = Text()

    usuario = String(60)
    contraseña = String(255)

    fecha_registro = DateTime

    compras = relationship("Compra", back_populates="cliente", cascade="all, delete-orphan")

    __table_args__ = (
        PrimaryKeyConstraint("cedula"),
        UniqueConstraint("email", name="uq_clientes_email"),
        UniqueConstraint("usuario", name="uq_clientes_usuario"),
    )

