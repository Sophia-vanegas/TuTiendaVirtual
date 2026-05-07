"""BD/models/productos.py

Modelo Producto.

- id_producto PK autoincremental
- nombre, tipo_producto
- cantidad stock >= 0
"""

from __future__ import annotations

from sqlalchemy import CheckConstraint, Integer, String, Column

from sqlalchemy.orm import relationship

from .base import Base


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, autoincrement=True)

    nombre = Column(String(150))

    tipo_producto = Column(String(80))

    cantidad = Column(Integer, nullable=False)


    detalles = relationship("DetalleCompra", back_populates="producto", cascade="all, delete-orphan")


    __table_args__ = (
        CheckConstraint("cantidad >= 0", name="chk_productos_cantidad_no_neg"),
    )

