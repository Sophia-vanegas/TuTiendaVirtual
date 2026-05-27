"""BD/triggers/mysql_triggers.py

Trigers MySQL (DDL) para validar producto/stock y descontar inventario.

Notas:
- El Frontend descuenta stock manualmente (en /api/compras). Aun así, dejamos triggers
  de validación para asegurar consistencia.
- Se requiere el esquema compatible con el Frontend:
  - productos: id, cantidad
  - compras: id
  - detalle_compras: compra_id, producto_id, cantidad
"""

from __future__ import annotations

from sqlalchemy import DDL, text


TRIGGERS = {
    "bi_detalle_validar_producto_existente": DDL(
        """
        CREATE TRIGGER bi_detalle_validar_producto_existente
        BEFORE INSERT ON detalle_compras
        FOR EACH ROW
        BEGIN
            IF (SELECT COUNT(*) FROM productos p WHERE p.id = NEW.producto_id) = 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no existe';
            END IF;
        END
        """
    ),
    "bi_detalle_validar_stock_suficiente": DDL(
        """
        CREATE TRIGGER bi_detalle_validar_stock_suficiente
        BEFORE INSERT ON detalle_compras
        FOR EACH ROW
        BEGIN
            DECLARE v_stock INT;

            SELECT p.cantidad INTO v_stock
            FROM productos p WHERE p.id = NEW.producto_id;

            IF v_stock < NEW.cantidad THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
            END IF;
        END
        """
    ),
}


def drop_triggers_if_exist(conn) -> None:
    """Dropea triggers si existen (MySQL no soporta IF EXISTS para todas las situaciones)."""
    for name in TRIGGERS.keys():
        conn.execute(text(f"DROP TRIGGER IF EXISTS `{name}`"))

