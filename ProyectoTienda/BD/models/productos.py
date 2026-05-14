"""BD/models/productos.py

Modelo Producto compatible con el Frontend.

Columnas esperadas por el Frontend (Supabase-like):
- id (PK)
- nombre, tipo_producto
- cantidad >= 0
- precio
"""

from __future__ import annotations

from sqlalchemy import CheckConstraint, Integer, Numeric, String, Column
from sqlalchemy.orm import relationship


from .base import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, autoincrement=True)

    nombre = Column(String(150))
    tipo_producto = Column(String(80))

    cantidad = Column(Integer, nullable=False)
    precio = Column(Numeric(12, 2))


    detalles = relationship(
        "DetalleCompra", back_populates="producto", cascade="all, delete-orphan"
    )


    __table_args__ = (
        CheckConstraint("cantidad >= 0", name="chk_productos_cantidad_no_neg"),
        CheckConstraint("precio >= 0", name="chk_productos_precio_no_neg"),
    )


