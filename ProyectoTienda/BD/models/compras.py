"""BD/models/compras.py

Modelo Compra (header) y DetalleCompra.

Compatible con el Frontend (Supabase-like):
- compras: id, cliente_id, total, created_at
- detalle_compras: id, compra_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal
"""

from __future__ import annotations

from sqlalchemy import CheckConstraint, DateTime, Integer, Numeric, String, func, Column, ForeignKey
from sqlalchemy.orm import relationship

from .base import Base


class Compra(Base):
    __tablename__ = "compras"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    total = Column(Numeric(12, 2), nullable=False)

    created_at = Column(DateTime, default=func.now())

    cliente = relationship("Cliente", back_populates="compras")
    detalle_compras = relationship(
        "DetalleCompra", back_populates="compra", cascade="all, delete-orphan"
    )

    __table_args__ = ()


class DetalleCompra(Base):
    __tablename__ = "detalle_compras"

    id = Column(Integer, primary_key=True, autoincrement=True)

    compra_id = Column(Integer, ForeignKey("compras.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)

    producto_nombre = Column(String(255), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    compra = relationship("Compra", back_populates="detalle_compras")

    # Relación opcional hacia Producto; el FK lo gestiona la lógica del frontend.
    producto = relationship("Producto", back_populates="detalles")

    __table_args__ = (
        CheckConstraint("cantidad > 0", name="chk_detalle_cantidad_positiva"),
    )

