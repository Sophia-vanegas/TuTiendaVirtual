"""BD/models/productos.py

<<<<<<< HEAD
Modelo Producto compatible con el Frontend.

Columnas esperadas por el Frontend (Supabase-like):
- id (PK)
- nombre, tipo_producto
- cantidad >= 0
- precio
=======
Modelo Producto.

- id_producto PK autoincremental
- nombre, tipo_producto
- cantidad stock >= 0
>>>>>>> 7664de4cdfa996adc1755e9660f22b279faf515e
"""

from __future__ import annotations

<<<<<<< HEAD
from sqlalchemy import CheckConstraint, Integer, Numeric, String, Column
from sqlalchemy.orm import relationship

=======
from sqlalchemy import CheckConstraint, Integer, String, Column

from sqlalchemy.orm import relationship
>>>>>>> 7664de4cdfa996adc1755e9660f22b279faf515e

from .base import Base


class Producto(Base):
    __tablename__ = "productos"

<<<<<<< HEAD
    id = Column(Integer, primary_key=True, autoincrement=True)

    nombre = Column(String(150))
    tipo_producto = Column(String(80))

    cantidad = Column(Integer, nullable=False)
    precio = Column(Numeric(12, 2))


    detalles = relationship(
        "DetalleCompra", back_populates="producto", cascade="all, delete-orphan"
    )
=======
    id_producto = Column(Integer, primary_key=True, autoincrement=True)

    nombre = Column(String(150))

    tipo_producto = Column(String(80))

    cantidad = Column(Integer, nullable=False)


    detalles = relationship("DetalleCompra", back_populates="producto", cascade="all, delete-orphan")
>>>>>>> 7664de4cdfa996adc1755e9660f22b279faf515e


    __table_args__ = (
        CheckConstraint("cantidad >= 0", name="chk_productos_cantidad_no_neg"),
<<<<<<< HEAD
        CheckConstraint("precio >= 0", name="chk_productos_precio_no_neg"),
    )


=======
    )

>>>>>>> 7664de4cdfa996adc1755e9660f22b279faf515e
