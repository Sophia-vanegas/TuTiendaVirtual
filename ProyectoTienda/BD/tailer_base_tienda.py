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
from sqlalchemy.orm import Session

from config.mysql import DATABASE_URL, DATABASE_URL_NO_DB, DB_NAME
from models.base import Base
from triggers.mysql_triggers import TRIGGERS, drop_triggers_if_exist

# Import para registrar modelos en Base.metadata
from models.administrador import Administrador  # noqa: F401
from models.clientes import Cliente  # noqa: F401
from models.productos import Producto  # noqa: F401
from models.compras import Compra, DetalleCompra  # noqa: F401

from seed.seed_data import seed_example_data



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

    # Migración mínima: asegurar que `detalle_compras.cantidad_comprada` exista.
    # Esto evita el error al crear el trigger si la BD ya existía con un esquema viejo.
    with engine.begin() as conn:
        # Comprueba existencia de la columna
        col = conn.execute(
            text("SHOW COLUMNS FROM detalle_compras LIKE 'cantidad_comprada'")
        ).fetchone()
        if col is None:
            conn.execute(
                text(
                    "ALTER TABLE detalle_compras ADD COLUMN cantidad_comprada INT NULL"
                )
            )

    # Triggers
    with engine.connect() as conn:
        drop_triggers_if_exist(conn)
        for ddl in TRIGGERS.values():
            try:
                conn.execute(ddl)
            except Exception as e:
                raise RuntimeError(f"Error creando trigger DDL: {ddl}") from e
        conn.commit()

    # Seed
    if with_seed:
        seed_example_data(engine)



if __name__ == "__main__":
    run_all(with_seed=True)
    print("Listo: esquema de MySQL para `tienda_barrio` creado y datos de ejemplo insertados.")

