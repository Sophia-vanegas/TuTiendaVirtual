"""BD/triggers/mysql_triggers.py

Trigers MySQL (DDL) para validar producto/stock y descontar inventario.

Se ejecutan desde el entrypoint.
"""

from __future__ import annotations

from sqlalchemy import DDL, text

TRIGGERS = {
    # Valida que el producto exista antes de insertar un detalle.
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

    # Valida stock suficiente al insertar cada detalle (ya no existe `confirmada`).
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

    # Descuenta inventario inmediatamente al insertar el detalle.
    "ai_detalle_descuenta_stock": DDL(
        """
        CREATE TRIGGER ai_detalle_descuenta_stock
        AFTER INSERT ON detalle_compras
        FOR EACH ROW
        BEGIN
            UPDATE productos p
            SET p.cantidad = p.cantidad - NEW.cantidad
            WHERE p.id = NEW.producto_id;
        END
        """
    ),
}



def drop_triggers_if_exist(conn) -> None:
    """Dropea triggers si existen (MySQL no soporta IF EXISTS para todas las situaciones)."""
    for name in TRIGGERS.keys():
        # nombres = keys (coinciden con los definidos en CREATE TRIGGER)
        conn.execute(text(f"DROP TRIGGER IF EXISTS `{name}`"))

