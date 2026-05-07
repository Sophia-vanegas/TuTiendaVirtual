"""BD/models/administrador.py

Modelo Administrador: única cuenta fija con credenciales.
"""

from __future__ import annotations

from sqlalchemy import CheckConstraint, Column, Integer, String, UniqueConstraint, PrimaryKeyConstraint



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


    # MySQL no permite CHECK constraints que referencien columnas AUTO_INCREMENT.
    __table_args__ = (
        UniqueConstraint("usuario", name="uq_admin_usuario"),
    )


