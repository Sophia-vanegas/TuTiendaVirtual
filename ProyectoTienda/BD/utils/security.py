"""BD/utils/security.py

Utilidades de seguridad y generación.

Incluye:
- hash SHA-256 con salt (formato sha256$salt$hash)
- generate_username para usuarios automáticos
"""

from __future__ import annotations

import hashlib
import secrets


def hash_password_sha256(password: str, salt: str | None = None) -> str:
    """Hashea una contraseña usando SHA-256 + salt.

    Nota: para producción se recomienda bcrypt/argon2.
    """
    if salt is None:
        salt = secrets.token_hex(16)
    data = (salt + password).encode("utf-8")
    digest = hashlib.sha256(data).hexdigest()
    return f"sha256${salt}${digest}"


def generate_username(nombre: str, apellidos: str) -> str:
    """Genera username a partir de nombre.apellidos, limitado a 30 caracteres."""
    base = (nombre or "").strip().lower() + "." + (apellidos or "").strip().lower()
    base = "".join(ch for ch in base if ch.isalnum() or ch == ".")
    base = base.strip(".")
    return base[:30] if base else f"cliente{secrets.randbelow(10_0000):05d}"

