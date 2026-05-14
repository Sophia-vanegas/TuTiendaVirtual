"""BD/models/compras.py

Modelos Compra y DetalleCompra compatibles con el Frontend.

Frontend espera (Supabase-like):
- compras: id, cliente_id, total, created_at
- detalle_compras: id, compra_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal
"""

from __future__ import annotations

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKeyConstraint,
    Integer,
    Numeric,
    String,
    func,
    Column,
)

from sqlalchemy.orm import relationship

from .base import Base


class Compra(Base):
    __tablename__ = "compras"

    id = Column(Integer, primary_key=True, autoincrement=True)


    cliente_id = Integer
    total = Numeric(12, 2)

    created_at = Column(DateTime, default=func.now())


    cliente = relationship("Cliente", back_populates="compras")
    detalle_compras = relationship(
        "DetalleCompra", back_populates="compra", cascade="all, delete-orphan"
    )

    __table_args__ = ()



class DetalleCompra(Base):
    __tablename__ = "detalle_compras"

    id = Column(Integer, primary_key=True, autoincrement=True)

    compra_id = Integer

    producto_id = Integer

    producto_nombre = String(255)
    cantidad = Integer
    precio_unitario = Numeric(12, 2)
    subtotal = Numeric(12, 2)

    compra = relationship("Compra", back_populates="detalle_compras")
    producto = relationship("Producto", back_populates="detalles")

    __table_args__ = (
        CheckConstraint("cantidad > 0", name="chk_detalle_cantidad_positiva"),
    )



