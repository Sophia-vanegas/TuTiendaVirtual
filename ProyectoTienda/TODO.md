<<<<<<< HEAD
# TODO for Installing Dependencies in ProyectoTienda/Backend

## Steps:
- [x] 1. Create virtual environment (venv)
- [x] 2. Create requirements.txt
- [x] 3. Activate venv and install dependencies
- [x] 4. Verify installation with pip list
- [ ] 5. Deactivate (optional)
=======
# TODO - Fix trigger stock insuficiente

- [ ] Inspeccionar en MySQL si `detalle_compras` ya tiene la columna `cantidad_comprada`.
- [ ] Si falta, agregar una migración/ALTER TABLE en `BD/tailer_base_tienda.py` para crear la columna sin eliminar la BD.
- [ ] Ajustar `BD/tailer_base_tienda.py` para que ejecute el ALTER antes de crear triggers.
- [ ] Re-ejecutar `python BD\tailer_base_tienda.py` y verificar que ya se crean los triggers.

>>>>>>> 7664de4cdfa996adc1755e9660f22b279faf515e
