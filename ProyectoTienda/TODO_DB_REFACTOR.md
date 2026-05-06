# TODO_DB_REFACTOR

## Paso 1: Refactor BD (estructura)
- [x] Crear subcarpetas: config, models, utils, triggers, seed, migrations
- [x] Crear entrypoint `BD/tailer_base_tienda.py`
- [ ] Mover/compartir Base y modelos en módulos
- [ ] Separar triggers
- [ ] Separar seed

## Paso 2: Validar ejecución y corregir errores
- [ ] Ejecutar `python BD\tailer_base_tienda.py`
- [ ] Corregir errores de SQLAlchemy hasta compilar
- [ ] Confirmar que crea tablas + triggers

## Paso 3: Validación de restricciones
- [ ] Verificar lógica de stock (triggers)
- [ ] Verificar descuento de inventario (confirmada 0->1)

