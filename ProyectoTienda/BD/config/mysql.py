"""BD/config/mysql.py

Configuración de conexión MySQL.

Se asume que MySQL corre en localhost y que la contraseña pedida es root123.
Puede sobrescribirse con variables de entorno.
"""

from __future__ import annotations

import os

DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "root123")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "tienda_barrio")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

DATABASE_URL_NO_DB = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/?charset=utf8mb4"
)

