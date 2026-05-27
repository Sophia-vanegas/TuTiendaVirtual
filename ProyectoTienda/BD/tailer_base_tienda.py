"""BD/tailer_base_tienda.py

Entrypoint ejecutable para:
- Crear DB `tienda_barrio` si no existe
- Crear tablas con SQLAlchemy models
- Crear triggers MySQL
- Insertar datos de ejemplo

Ejecutar:
    python BD\tailer_base_tienda.py
"""

from __future__ import annotations

from sqlalchemy import create_engine, text

from BD.config.mysql import DATABASE_URL, DATABASE_URL_NO_DB, DB_NAME
from BD.models.base import Base
from BD.triggers.mysql_triggers import TRIGGERS, drop_triggers_if_exist

# Import para registrar modelos en Base.metadata
from BD.models.administrador import Administrador  # noqa: F401
from BD.models.clientes import Cliente  # noqa: F401
from BD.models.productos import Producto  # noqa: F401
from BD.models.compras import Compra, DetalleCompra  # noqa: F401

from BD.seed.seed_data import seed_example_data


def ensure_database_exists() -> None:
    engine_admin = create_engine(DATABASE_URL_NO_DB, future=True)
    with engine_admin.connect() as conn:
        conn.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
            )
        )
        conn.commit()


def run_all(with_seed: bool = True) -> None:
    ensure_database_exists()

    engine = create_engine(DATABASE_URL, future=True)

    # Tablas
    Base.metadata.create_all(engine)

    # Triggers
    with engine.connect() as conn:
        drop_triggers_if_exist(conn)
        for ddl in TRIGGERS.values():
            conn.execute(ddl)
        conn.commit()

    # Seed
    if with_seed:
        seed_example_data(engine)


if __name__ == "__main__":
    run_all(with_seed=True)
    print("Listo: esquema de MySQL para `tienda_barrio` creado y datos de ejemplo insertados.")

