"""BD/models/compras.py

Modelo Compra (header) y DetalleCompra.

Incluye campo `confirmada` para controlar el descuento de inventario
vía trigger (transición 0 -> 1).
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
    PrimaryKeyConstraint,
)
from sqlalchemy.orm import relationship

from .base import Base


class Compra(Base):
    __tablename__ = "compras"

    id_compra = Integer

    cedula_cliente = String(20)
    fecha_compra = DateTime(server_default=func.now())
    total = Numeric(12, 2)

    confirmada = Integer(nullable=False, server_default="0")

    cliente = relationship("Cliente", back_populates="compras")
    detalles = relationship("DetalleCompra", back_populates="compra", cascade="all, delete-orphan")

    __table_args__ = (
        PrimaryKeyConstraint("id_compra"),
        ForeignKeyConstraint(["cedula_cliente"], ["clientes.cedula"], name="fk_compras_cliente"),
    )


class DetalleCompra(Base):
    __tablename__ = "detalle_compras"

    id_detalle = Integer
    id_compra = Integer
    id_producto = Integer

    cantidad_comprada = Integer
    precio_unitario = Numeric(12, 2)

    compra = relationship("Compra", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles")

    __table_args__ = (
        PrimaryKeyConstraint("id_detalle"),
        ForeignKeyConstraint(["id_compra"], ["compras.id_compra"], name="fk_detalle_compra_header"),
        ForeignKeyConstraint(["id_producto"], ["productos.id_producto"], name="fk_detalle_producto"),
        CheckConstraint("cantidad_comprada > 0", name="chk_detalle_cantidad_positiva"),
    )

