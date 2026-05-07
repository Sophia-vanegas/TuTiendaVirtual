# TODO - Fix trigger stock insuficiente

- [ ] Inspeccionar en MySQL si `detalle_compras` ya tiene la columna `cantidad_comprada`.
- [ ] Si falta, agregar una migración/ALTER TABLE en `BD/tailer_base_tienda.py` para crear la columna sin eliminar la BD.
- [ ] Ajustar `BD/tailer_base_tienda.py` para que ejecute el ALTER antes de crear triggers.
- [ ] Re-ejecutar `python BD\tailer_base_tienda.py` y verificar que ya se crean los triggers.

