# Backend de ejemplo (opcional)
Este directorio contiene **un ejemplo mínimo** de backend en Node.js/Express que recibe el `POST` del sitio y publica el mensaje en la cola **`CONTACTO`** de RabbitMQ usando `amqplib`.

> ⚠️ **Nota:** El sitio funciona con una URL genérica por defecto (`https://example.com/api/contact`). Si quieres probar localmente, levanta este backend y cambia el atributo `data-endpoint` del formulario en `index.html` a `http://localhost:3000/contact`.

## Requisitos
- Node.js 18+
- RabbitMQ en ejecución (localhost) o una URL AMQP accesible
- Cola: `CONTACTO` (se crea automáticamente si no existe)

## Variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```env
AMQP_URL=amqp://guest:guest@localhost:5672
PORT=3000
CORS_ORIGIN=*
```

## Instalación y ejecución

```bash
cd backend-example
npm install
npm run dev   # para desarrollo (nodemon)
# o
npm start     # producción
```

El endpoint quedará expuesto en: `http://localhost:3000/contact`

## Estructura del mensaje
El sitio envía un JSON como este:

```json
{
  "queue": "CONTACTO",
  "source": "web:harnesses-r-us",
  "timestamp": "2025-09-05T18:00:00.000Z",
  "data": {
    "name": "Nombre",
    "company": "Empresa S.A.",
    "email": "correo@dominio.com",
    "phone": "+1 555 123 4567",
    "message": "Requiero 5k sets con conector Molex 5557, AWG18."
  }
}
```

Este backend publica `data` en la cola `CONTACTO` y preserva `source` y `timestamp` en las propiedades del mensaje.
