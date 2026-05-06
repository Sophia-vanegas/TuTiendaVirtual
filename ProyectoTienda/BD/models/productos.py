"""BD/models/productos.py

Modelo Producto.

- id_producto PK autoincremental
- nombre, tipo_producto
- cantidad stock >= 0
"""

from __future__ import annotations

from sqlalchemy import CheckConstraint, Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Integer
    nombre = String(150)
    tipo_producto = String(80)
    cantidad = Integer(nullable=False)

    detalles = relationship("DetalleCompra", back_populates="producto", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("cantidad >= 0", name="chk_productos_cantidad_no_neg"),
    )

