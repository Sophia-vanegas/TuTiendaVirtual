"""BD/models/administrador.py

Modelo Administrador: única cuenta fija con credenciales.
"""

from __future__ import annotations

<<<<<<< HEAD
from sqlalchemy import CheckConstraint, Column, Integer, PrimaryKeyConstraint, String, UniqueConstraint
=======
from sqlalchemy import CheckConstraint, Column, Integer, String, UniqueConstraint, PrimaryKeyConstraint


>>>>>>> 7664de4cdfa996adc1755e9660f22b279faf515e

from .base import Base


class Administrador(Base):
    """Administrador con credenciales fijas.

    Requisitos:
    - tabla exclusiva con id_admin fijo
    - usuario único
    - contraseña almacenada hasheada
    """

    __tablename__ = "administradores"

    id_admin = Column(Integer, primary_key=True)
    usuario = Column(String(60), nullable=False, unique=True)
    contraseña = Column(String(255), nullable=False)


<<<<<<< HEAD
    __table_args__ = (
        PrimaryKeyConstraint("id_admin"),
        CheckConstraint("id_admin = 1", name="chk_admin_id_fijo"),
        UniqueConstraint("usuario", name="uq_admin_usuario"),
    )

=======
    # MySQL no permite CHECK constraints que referencien columnas AUTO_INCREMENT.
    __table_args__ = (
        UniqueConstraint("usuario", name="uq_admin_usuario"),
    )


>>>>>>> 7664de4cdfa996adc1755e9660f22b279faf515e
