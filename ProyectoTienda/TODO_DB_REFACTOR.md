# TODO_DB_REFACTOR

## Paso 1 — Models (MySQL + SQLAlchemy)
- [x] Editar `BD/models/productos.py` para que tenga columnas: `id`, `nombre`, `tipo_producto`, `cantidad`, `precio`
- [x] Editar `BD/models/clientes.py` para que tenga columnas: `id` (PK), `user_id`, `cedula`, `nombre`, `apellidos`, `email`, `celular`, `direccion`, `created_at`
- [x] Editar `BD/models/compras.py` para que tenga columnas: `id` (PK), `cliente_id`, `total`, `created_at` y `detalle_compras` con: `id`, `compra_id`, `producto_id`, `producto_nombre`, `cantidad`, `precio_unitario`, `subtotal`



## Paso 2 — Relaciones / Constraints
- [ ] Ajustar Foreign Keys para: `compras.cliente_id -> clientes.id`, `detalle_compras.compra_id -> compras.id`, `detalle_compras.producto_id -> productos.id`

## Paso 3 — Triggers MySQL
- [ ] Revisar `BD/triggers/mysql_triggers.py` para que ya no dependa de `confirmada` (frontend no la usa)
- [ ] Adaptar validaciones/stock según el nuevo esquema

## Paso 4 — Seed + ejecución
- [ ] Actualizar `BD/seed/seed_data.py` para insertar usando los nuevos campos/PKs
- [ ] Ejecutar `python BD\tailer_base_tienda.py` y verificar que crea tablas y triggers

