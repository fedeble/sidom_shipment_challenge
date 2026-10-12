# Challenge SIDOM — Shipments API

API HTTP para crear embarques, agregar ítems a contenedores y consultar el agregado completo.

## Requisitos

- Node.js `24.21.0`
- npm `11.19.0`
- Docker y Docker Compose para la ejecución contenerizada
- VS Code con la extensión REST Client para ejecutar los archivos de [rest-client/](rest-client/)

## Arranque local

```powershell
npm ci
npm run build
npm run start:dev
```

La API escucha en `http://127.0.0.1:3000` por defecto. `PORT` permite cambiar el puerto. `NODE_ENV` acepta `development`, `test` y `production`; `SEED_ENABLED=false` desactiva la precarga para pruebas.

## Docker

```powershell
docker compose up --build
```

El contenedor expone el puerto `3000` y usa `/readiness` como healthcheck. El almacenamiento es exclusivamente en memoria: al reiniciar se pierden los cambios y vuelve a cargarse el fixture inicial cuando `SEED_ENABLED=true`.

## Endpoints

| Método | Ruta | Resultado |
|---|---|---|
| `POST` | `/shipments` | Crea un embarque con uno o más contenedores, una factura comercial y un packing list. |
| `GET` | `/shipments?status=CREATED&limit=20&size=1` | Lista embarques en memoria; `status` filtra, `limit` define el tamaño de página y `size` el número de página. |
| `POST` | `/shipments/:shipmentId/containers/:containerId/items` | Agrega un ítem al contenedor indicado. |
| `GET` | `/shipments/:shipmentId` | Devuelve el embarque completo, sus contenedores, ítems y documentos. |
| `GET` | `/liveness` | Confirma que el proceso atiende requests. |
| `GET` | `/readiness` | Confirma que la aplicación y el almacenamiento están disponibles. |

Swagger UI está disponible en `/docs` y el contrato JSON en `/openapi.json`.

## Modelado

Se modeló de la siguiente forma:
- Cada embarque nace con uno o más contenedores; cada contenedor puede tener cero ítems.
- La creación debe incluir exactamente un documento `COMMERCIAL_INVOICE` y uno `PACKING_LIST`; se rechazan documentos faltantes, duplicados o de tipo desconocido.
- Estado inicial `CREATED`, asignado por defecto (sin endpoint para cambiarlo).
- Ítem con descripción y cantidad entera positiva, interpretada como unidades.
- Origen y destino como texto no vacío; no imponer catálogos ni reglas geográficas no solicitadas.
- IDs UUID generados por el servidor. El cliente no puede asignar IDs, estado ni pertenencias.
- Un contenedor pertenece a un embarque; un ítem, a un contenedor; un documento, a un embarque.

Tomé estas decisiones con base en el modelo propuesto y en los aspectos que no estaban completamente definidos:
- Cada embarque tiene que tener al menos un contenedor, ya que no hay endpoint para crear contenedores nuevos en embarques existentes.
- Cada contenedor puede nacer con cero ítems, ya que sí existe un endpoint para crear ítems dentro de un contenedor.

## Exclusiones

Tuve que dejar fuera de la implementación, principalmente, el uso de persistencia en una base de datos. Consideré que no era necesario invertir tiempo en configurar una base de datos que pudiera levantarse en la PC de un posible cliente durante el inicio de Docker para la demo.
Consideré utilizar SQLite en un archivo para levantar una mini base de datos durante la ejecución, pero también habría requerido tiempo de configuración y pruebas.
Para este caso, como es una demo, decidí hacerla lo más simple posible, sin persistencia de datos y acotada a las consignas principales, sin endpoints adicionales ni validaciones.

No se agregan funciones de persistencia, autenticación, archivos, microservicios, frontend, integraciones COMEX ni operaciones fuera de crear, consultar y agregar ítems. La API es una demo local sin control de acceso entre usuarios.

## Si tuviera más tiempo

En este caso, si tuviera más tiempo para seguir desarrollando la aplicación, pondría el foco en agregar persistencia de datos en una base. Inicialmente consideré utilizar SQLite, pero me preocupaba que el tiempo de configuración y las pruebas iniciales absorbieran el tiempo disponible.
Por otro lado, si fuera una demo real, pondría más foco en el uso de permisos o autenticación por JWT, además de mejorar el uso de los logs y observabilidad.

## Asistencia de IA

Para este caso usé Codex como asistente. Principalmente lo utilicé para crear el plan de implementación junto con las instrucciones de AGENTS.md. Una vez el plan de implementación y la estructura del proyecto quedaron bien definidos, seguí usando el agente para que siga el paso a paso de la creación de archivos revisando en cada paso los cambios realizados.
Uno de los casos que tuve que revisar a mano fue el funcionamiento del endpoint que agregué al final para consultar el listado de embarques. No funcionaba porque los filtros `limit` y `size` no estaban configurados como números (`@Type(() => Number)`).
Si bien el agente generó la mayoría del código y tests todo fue revisado, validado según el plan de implementación y la guía de arquitectura y testeado.
