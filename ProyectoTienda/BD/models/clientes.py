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

    # SQLAlchemy 2.x: las columnas deben declararse usando Column(...)
    cedula = Column(String(20, collation="utf8mb4_0900_ai_ci"), primary_key=True)
    nombre = Column(String(100))
    apellidos = Column(String(150))
    email = Column(String(150), nullable=False)
    celular = Column(String(30))
    direccion = Column(Text())

    usuario = Column(String(60), nullable=False)
    contraseña = Column(String(255), nullable=False)

    fecha_registro = Column(DateTime, nullable=True)

    compras = relationship("Compra", back_populates="cliente", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("email", name="uq_clientes_email"),
        UniqueConstraint("usuario", name="uq_clientes_usuario"),
    )


