# 🚀 Guía de Despliegue - TuTiendaVirtual

## Estructura del Proyecto
```
ProyectoTienda/
├── Frontend/        (Next.js - Vercel)
├── Backend/         (FastAPI - Heroku)
└── BD/              (Database scripts)
```

---

## 📋 Parte 1: Despliegue del Backend (FastAPI en Heroku)

### Requisitos Previos
- Cuenta en [Heroku](https://www.heroku.com)
- Heroku CLI instalado: `npm install -g heroku`

### Pasos

1. **Inicia sesión en Heroku**
   ```bash
   heroku login
   ```

2. **Crea una nueva aplicación en Heroku**
   ```bash
   cd Backend
   heroku create nombre-tu-tienda-api
   ```

3. **Configura las variables de entorno** (SMTP para emails)
   ```bash
   heroku config:set SMTP_SERVER=smtp.gmail.com
   heroku config:set SMTP_PORT=587
   heroku config:set SMTP_USER=tu-correo@gmail.com
   heroku config:set SMTP_PASS=tu-contraseña-app
   ```

4. **Despliega el backend**
   ```bash
   git push heroku main
   ```

5. **Tu API estará en:**
   ```
   https://nombre-tu-tienda-api.herokuapp.com
   ```

---

## 📋 Parte 2: Despliegue del Frontend (Next.js en Vercel)

### Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Vercel CLI: `npm install -g vercel` (opcional)

### Pasos

1. **Instala dependencias locales**
   ```bash
   cd Fronted
   npm install
   ```

2. **Crea un archivo `.env.local`**
   ```bash
   NEXT_PUBLIC_API_URL=https://nombre-tu-tienda-api.herokuapp.com
   ```

3. **Prueba localmente**
   ```bash
   npm run dev
   ```
   Visita: http://localhost:3000

4. **Despliega con Git (Recomendado)**
   - Sube tu código a GitHub
   - Ve a https://vercel.com/import
   - Conecta tu repositorio GitHub
   - Vercel detectará Next.js automáticamente
   - Configura la variable de entorno `NEXT_PUBLIC_API_URL`
   - Haz clic en Deploy

5. **Tu sitio web estará en:**
   ```
   https://tu-tienda.vercel.app
   ```

---

## ⚙️ Configuración de Variables de Entorno

### Backend (Heroku)
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-app (usar contraseña de app de Gmail)
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://nombre-tu-tienda-api.herokuapp.com
```

---

## 🧪 Verificación Post-Despliegue

### Backend
```bash
curl https://nombre-tu-tienda-api.herokuapp.com/docs
```

### Frontend
Abre https://tu-tienda.vercel.app en tu navegador

---

## 📝 Notas Importantes

1. **Gmail SMTP**: Para usar Gmail, necesitas [generar una contraseña de aplicación](https://support.google.com/accounts/answer/185833)
2. **Base de Datos**: El Backend usa SQLite. Los datos se guardan localmente en `tienda.db`
3. **CORS**: El Backend está configurado para aceptar solicitudes desde cualquier origen
4. **Proxy**: El archivo `proxy.ts` en el Frontend enruta solicitudes correctamente

---

## 🔗 Links Útiles
- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Documentación Next.js](https://nextjs.org/docs)
- [Heroku Deployment Docs](https://devcenter.heroku.com/)
- [Vercel Deployment Docs](https://vercel.com/docs)

---

## ❓ Solución de Problemas

### Error: "Proxy is missing expected function export"
✅ **Solucionado**: El archivo `proxy.ts` ha sido actualizado con la exportación correcta

### Error CORS
- Asegúrate de que `NEXT_PUBLIC_API_URL` en Vercel apunta correctamente
- Verifica que el Backend está corriendo en Heroku

### Base de datos no se actualiza
- La BD SQLite se guarda localmente en el Backend
- Para persistencia, considera migrar a PostgreSQL en Heroku

