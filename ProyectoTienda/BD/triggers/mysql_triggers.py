"""BD/triggers/mysql_triggers.py

Trigers MySQL (DDL) para validar producto/stock y descontar inventario.

Se ejecutan desde el entrypoint.
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
            IF (SELECT COUNT(*) FROM productos p WHERE p.id_producto = NEW.id_producto) = 0 THEN
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
            DECLARE v_confirmada INT;
            DECLARE v_stock INT;

            SELECT c.confirmada INTO v_confirmada
            FROM compras c WHERE c.id_compra = NEW.id_compra;

            IF v_confirmada = 1 THEN
                SELECT p.cantidad INTO v_stock
                FROM productos p WHERE p.id_producto = NEW.id_producto;

                IF v_stock < NEW.cantidad_comprada THEN

                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
                END IF;
            END IF;
        END
        """
    ),

    "au_compras_descuenta_stock_al_confirmar": DDL(
        """
        CREATE TRIGGER au_compras_descuenta_stock_al_confirmar
        AFTER UPDATE ON compras
        FOR EACH ROW
        BEGIN
            IF OLD.confirmada = 0 AND NEW.confirmada = 1 THEN
                UPDATE productos p
                JOIN (
                    SELECT d.id_producto, SUM(d.cantidad_comprada) AS qty
                    FROM detalle_compras d
                    WHERE d.id_compra = NEW.id_compra
                    GROUP BY d.id_producto
                ) agg
                ON agg.id_producto = p.id_producto
                SET p.cantidad = p.cantidad - agg.qty;
            END IF;
        END
        """
    ),
}


def drop_triggers_if_exist(conn) -> None:
    """Dropea triggers si existen (MySQL no soporta IF EXISTS para todas las situaciones)."""
    for name in TRIGGERS.keys():
        # nombres = keys (coinciden con los definidos en CREATE TRIGGER)
        conn.execute(text(f"DROP TRIGGER IF EXISTS `{name}`"))

