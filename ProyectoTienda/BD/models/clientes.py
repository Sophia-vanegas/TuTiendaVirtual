"""BD/models/clientes.py

Modelo Cliente compatible con el Frontend.

El Frontend consulta:
- clientes.eq("user_id", user.id).single()

Columnas esperadas:
- id (PK)
- user_id
- cedula, nombre, apellidos, email, celular, direccion
- created_at

Se conservan campos de credenciales para el flujo actual si aplica.
"""

from __future__ import annotations

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint, Column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(String(60), nullable=False, index=True)

    cedula = Column(String(20, ), nullable=False)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, index=True)
    celular = Column(String(30))
    direccion = Column(Text())

    # Campos usados por seed/autenticación local (se conservan)
    usuario = Column(String(60))
    contraseña = Column(String(255))

    created_at = Column(DateTime, default=func.now())

    compras = relationship(
        "Compra", back_populates="cliente", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("email", name="uq_clientes_email"),
        UniqueConstraint("user_id", name="uq_clientes_user_id"),
    )

