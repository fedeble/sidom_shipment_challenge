# Plan de implementación — Challenge SIDOM

Estado: plan preparado; implementación no iniciada. Los supuestos pendientes deben resolverse antes de implementar su comportamiento.

## 1. Objetivo y alcance

Entregar una API pequeña en Node.js, TypeScript y NestJS, con arquitectura hexagonal, almacenamiento en memoria, Docker, OpenAPI/Swagger, Jest y colección Postman. Respetar el límite de 3 horas de la consigna y declarar cualquier exceso real. Registrar también el tiempo de preparación específica; no asumir que queda excluido.

Operaciones: crear embarque con contenedores, agregar un ítem a un contenedor y consultar el embarque completo. Modelar las cuatro entidades, incluidos los documentos aduaneros.

Fuera de alcance: SQLite u otra base persistente, autenticación, multitenencia, archivos adjuntos, integraciones COMEX, frontend, CRUD adicional, transiciones de estado, microservicios y despliegue público. La API será una demo local sin controles de acceso entre usuarios.

## 2. Decisiones y supuestos

### Confirmado por el usuario

- Node.js `24.21.0` + NestJS `11.2.1` + TypeScript `5.9.3`.
- Arquitectura hexagonal.
- Almacenamiento en memoria: los cambios se pierden al reiniciar.
- Ejecución con Docker, contrato OpenAPI y Swagger UI.
- Tests Jest y set de requests Postman.
- Raíz del proyecto: `Challenge/`.

### Decisiones confirmadas

- Todo embarque debe crearse con al menos un contenedor.
- Los dos documentos aduaneros son obligatorios al crear el embarque: una factura comercial y un packing list. Se representan como metadatos `type` y `reference`; no se suben archivos.
- Precargar datos ficticios en cada proceso nuevo para las primeras pruebas. No equivale a persistir los cambios entre reinicios.

### Instrucciones para herramientas de IA

`.github/copilot-instructions.md` no es un requisito del challenge. La guía específica para el agente vive en `AGENTS.md`, con reglas breves para reducir lecturas y contexto innecesarios. El README documenta el producto para el evaluador; este plan documenta las decisiones de implementación. No duplicar esos documentos dentro de cada prompt.

### Fixture inicial de demo

El seed se ejecutará una sola vez durante el bootstrap de cada proceso, antes de aceptar requests. Debe ser idempotente dentro del proceso, usar IDs estables y poder desactivarse en tests con `SEED_ENABLED=false`.

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "origin": "Buenos Aires, Argentina",
  "destination": "Montevideo, Uruguay",
  "status": "CREATED",
  "containers": [
    {
      "id": "22222222-2222-4222-8222-222222222221",
      "reference": "CONT-DEMO-001",
      "items": [
        {
          "id": "33333333-3333-4333-8333-333333333331",
          "description": "Repuestos industriales",
          "quantity": 24
        },
        {
          "id": "33333333-3333-4333-8333-333333333332",
          "description": "Manual de operación",
          "quantity": 24
        }
      ]
    },
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "reference": "CONT-DEMO-002",
      "items": []
    }
  ],
  "documents": [
    {
      "id": "44444444-4444-4444-8444-444444444441",
      "type": "COMMERCIAL_INVOICE",
      "reference": "INV-DEMO-2026-001"
    },
    {
      "id": "44444444-4444-4444-8444-444444444442",
      "type": "PACKING_LIST",
      "reference": "PL-DEMO-2026-001"
    }
  ]
}
```

El fixture cubre un embarque con dos contenedores, un contenedor con ítems, otro vacío y los dos tipos de documento como metadatos. Postman debe consultar este embarque usando el ID estable, agregar un ítem al contenedor vacío y comprobar la respuesta. Los IDs generados para nuevas entidades deben ser dinámicos; el fixture no debe confundirse con datos persistidos.

### Versiones compatibles fijadas

Para mantener una instalación reproducible se usará una línea estable y alineada:

| Componente | Versión | Regla |
|---|---:|---|
| Node.js | `24.21.0` | Fija; también en `.nvmrc` y `node:24.21.0` del Dockerfile |
| `@nestjs/common` | `11.2.1` | Misma major y versión que el núcleo |
| `@nestjs/core` | `11.2.1` | Misma major y versión que Common |
| `@nestjs/platform-express` | `11.2.1` | Misma major y versión que Core |
| `@nestjs/testing` | `11.2.1` | Misma major y versión que Core |
| `@nestjs/swagger` | `11.2.x` | Misma major que Nest; fijar el patch disponible durante la instalación |
| `@nestjs/cli` | `11.x` | Compatible con la major del framework |
| TypeScript | `5.9.3` | Dependencia de desarrollo fijada, sin `latest` |

La elección de TypeScript `5.9.3` evita adoptar TypeScript 7 durante este challenge, aunque exista una versión más nueva, porque el starter oficial de Nest mantiene TypeScript 5.9.3 en su línea actual. Nest declara Node `>=20` en sus paquetes y la documentación actual exige Node `>=20.19` para ejecutar y `>=24.15` para los generadores en la línea 24; Node `24.21.0` cumple ambos requisitos. No mezclar Nest 10, 11 y 12 en el mismo `package.json`. Después de instalar, conservar `package-lock.json` y validar con `npm ls` que no haya versiones mayores duplicadas.

### Supuestos de implementación propuestos

- Cada embarque nace con uno o más contenedores; cada contenedor puede tener cero ítems.
- La creación debe incluir exactamente un documento `COMMERCIAL_INVOICE` y uno `PACKING_LIST`; se rechazan documentos faltantes, duplicados o de tipo desconocido.
- Estado inicial `CREATED`, asignado por el servidor. Sin endpoint para cambiarlo.
- Ítem con descripción y cantidad entera positiva, interpretada como unidades. No modelar peso, moneda o valor comercial.
- Origen y destino como texto no vacío; no imponer catálogos ni reglas geográficas no solicitadas.
- IDs UUID generados por el servidor. El cliente no puede asignar IDs, estado ni pertenencias.
- Un contenedor pertenece a un embarque; un ítem, a un contenedor; un documento, a un embarque.
- Textos con límites explícitos y colecciones/cuerpo HTTP acotados. Elegir valores razonables, documentarlos y probar sus límites.

## 3. Modelo mínimo

| Entidad | Campos propuestos |
|---|---|
| Shipment | id, origin, destination, status, containers, documents |
| Container | id, items |
| CargoItem | id, description, quantity |
| CustomsDocument | id, type, reference |

Tipos documentales: `COMMERCIAL_INVOICE`, `PACKING_LIST`. Los documentos se asocian al embarque, no al contenedor. Los metadatos no representan el contenido completo de una factura o un packing list.

Usar Shipment como raíz del agregado; guardar el árbol completo en un `Map<string, ShipmentSnapshot>`. No crear cuatro repositorios por la sola existencia de cuatro entidades.

## 4. Arquitectura y dependencias

```text
src/
  main.ts
  app.module.ts
  shipments/
    domain/                 # entidades, invariantes y errores puros
    application/
      ports/                # contratos de salida, incluido ShipmentStore
      use-cases/            # CreateShipment, AddCargoItem, GetShipment
    adapters/
      inbound/http/         # controller, DTOs, respuestas, mapeo de errores
      outbound/in-memory/   # adaptador Map y snapshots
    shipments.module.ts     # composición de dependencias Nest
  bootstrap/                # configuración HTTP compartida y seed si se acepta
test/                       # integración HTTP
postman/                    # colección y entorno local sin secretos
docs/                       # OpenAPI exportado
  AGENTS.md                # instrucciones específicas para el agente
Dockerfile
compose.yaml
.dockerignore
README.md
```

Dependencias: HTTP → aplicación → dominio. El adaptador en memoria implementa el puerto definido por la aplicación. Dominio y aplicación no importan NestJS, Swagger ni el adaptador concreto.

### Inyección de dependencias

Usar inyección de dependencias de NestJS para todos los casos de uso y puertos de salida. Registrar el adaptador en memoria mediante un token estable, por ejemplo `SHIPMENT_STORE`, y hacer que los casos de uso dependan de ese contrato, no de `InMemoryShipmentStore`. Esto permite reemplazar el adaptador por una futura base de datos, API externa o doble de test modificando la composición del módulo.

La inyección no debe convertirse en una capa de abstracciones sin uso: crear interfaces únicamente para dependencias que realmente puedan cambiar o deban aislarse en tests. El dominio puro puede instanciarse directamente en tests; los tests de integración deben construir el módulo Nest con el adaptador en memoria.

### Logs por ambiente

Incorporar logs estructurados mínimos mediante el `Logger` de NestJS, detrás de una configuración común. La variable `NODE_ENV` define el comportamiento:

- `development`: niveles `debug`, `log`, `warn` y `error`; salida legible para desarrollo.
- `test`: silenciar por defecto `log` y `debug` para no ensuciar Jest; conservar `warn` y `error` cuando ayuden a diagnosticar un fallo.
- `production`: niveles `log`, `warn` y `error`, salida estructurada en JSON a stdout/stderr para que Docker pueda recolectarla.

No registrar cuerpos completos de requests, documentos, secretos ni datos innecesarios. Incluir método, ruta, status, duración y un `requestId` generado por middleware/interceptor. No agregar una plataforma de observabilidad para este challenge; dejar el logger encapsulado para poder sustituirlo después. Probar que un error inesperado se registra sin exponer stack trace en la respuesta HTTP.

Componer casos de uso mediante factories/providers en el módulo Nest; usar token Symbol para el puerto porque las interfaces TypeScript no existen en runtime. Repositorio singleton por proceso.

Almacenar y devolver copias profundas de snapshots para impedir mutaciones por referencia. Construir y validar el agregado completo antes de guardar. Para este adaptador, la modificación leer-validar-guardar debe ejecutarse sin cesión asíncrona intermedia; si se introducen awaits entre lectura y escritura, resolver actualizaciones concurrentes mediante operación atómica del puerto o control de versión. No afirmar soporte multiinstancia.

## 5. Contrato HTTP

| Método y ruta | Entrada | Salida |
|---|---|---|
| POST /shipments | origin, destination, containers; documents si se acepta | 201 y embarque creado |
| POST /shipments/:shipmentId/containers/:containerId/items | description, quantity | 201 e ítem creado |
| GET /shipments/:shipmentId | UUID | 200 y embarque completo |

La consulta incluye estado, contenedores, ítems y documentos, con arrays vacíos donde corresponda.

- 400: cuerpo, identificador o regla de negocio inválidos, incluida duplicación de tipo documental dentro de la creación.
- 404: embarque o contenedor inexistente, o contenedor ajeno al embarque de la ruta.
- 500: error inesperado; respuesta sin stack ni detalles internos.
- Formato estable de error: statusCode, code y message; detalles de validación cuando correspondan.
- No incorporar 409 sin una regla de conflicto concreta.

Validación HTTP global con whitelist, rechazo de propiedades desconocidas y validación anidada. Las invariantes también se protegen en el dominio, sin depender de los DTOs.

Fuente de verdad técnica del contrato: DTOs y metadatos HTTP con generación OpenAPI. Diseñar primero las formas de entrada/salida; después generar `/openapi.json`, Swagger UI en `/docs` y snapshot versionado `docs/openapi.json`. No mantener un YAML independiente a mano. Swagger no reemplaza la validación de requests.

### DTOs y límites del modelo

Usar DTOs para todos los datos que entren o salgan por HTTP. Los DTOs pertenecen al adaptador `inbound/http` y representan el contrato externo; no deben convertirse en las entidades del dominio ni circular hacia los casos de uso.

DTOs mínimos:

- `CreateShipmentDto`: `origin`, `destination`, `containers` y `documents`.
- `CreateContainerDto`: `reference` y, si se mantiene el alcance acordado, no incluir ítems iniciales.
- `CreateCustomsDocumentDto`: `type` y `reference`.
- `AddCargoItemDto`: `description` y `quantity`.
- `ShipmentResponseDto`, `ContainerResponseDto`, `CargoItemResponseDto` y `CustomsDocumentResponseDto` para respuestas estables.

Aplicar `ValidationPipe` global con `transform: true`, `whitelist: true` y `forbidNonWhitelisted: true`. Usar `class-validator` para obligatoriedad, enums, UUIDs, límites de texto, cantidades positivas y arrays no vacíos. Usar `class-transformer` para la validación de objetos anidados. La regla de negocio de que debe existir exactamente una factura comercial y un packing list se valida en el caso de uso/dominio, aunque el DTO valide la forma del request.

El flujo debe ser explícito: `HTTP request → DTO validado → comando de aplicación → entidad/agregado de dominio → response DTO`. No aceptar directamente entidades de dominio desde el controlador ni devolver referencias mutables del repositorio. Documentar los DTOs con decoradores de Swagger para generar el mismo contrato que se ejecuta.

## 6. Implementación paso a paso — presupuesto objetivo 180 minutos

Los tiempos son orientativos, no una garantía; incluyen todas las piezas solicitadas. Al agotarse el tiempo, documentar el estado real en vez de ocultar faltantes o extender silenciosamente el alcance.

### Paso 1 — Decisiones y guía de trabajo (0–15 min)

- Resolver propuestas pendientes y registrar supuestos.
- Mantener este plan como fuente principal de decisiones y `AGENTS.md` como guía operativa del agente, con alcance, arquitectura, reglas, comandos y criterio de finalización. No crear `.github/copilot-instructions.md`.
- Mantener un registro breve de IA: generado, corregido y revisado manualmente.
- Definir ejemplos de aceptación y payloads de las tres operaciones.
- Definir `NODE_ENV`, niveles de log y formato de salida por ambiente.

Criterio: no quedan ambigüedades bloqueantes de modelo o alcance.

### Paso 2 — Base ejecutable y composición (15–30 min)

- Inicializar NestJS con TypeScript estricto, npm y lockfile.
- Fijar Node.js `24.21.0` en desarrollo, CI si se agrega y Docker; documentar la versión de npm incluida y verificarla con `node --version` antes de la entrega.
- Agregar `.nvmrc` con `24.21.0` como ayuda para entornos que usen nvm; la fuente de verdad del contenedor será `node:24.21.0`.
- Configurar scripts de build, lint, tests unitarios, tests HTTP y exportación OpenAPI.
- Crear esqueleto hexagonal y configuración HTTP reutilizable por arranque y tests.
- Preparar Dockerfile multietapa basado en `node:24.21.0` y Compose; escucha en 0.0.0.0, puerto configurable y ejecución sin root.

Criterio: compila y arranca; no introducir infraestructura extra.

### Paso 3 — Dominio y memoria con tests (30–60 min)

- Implementar las cuatro entidades y reglas acordadas.
- Escribir primero tests de invariantes relevantes y luego código mínimo.
- Implementar puerto y repositorio singleton con copias defensivas.
- Verificar que un fallo no produzca escritura parcial ni mutación accidental.
- Añadir el seed confirmado: fixture ficticio versionado, carga antes de escuchar HTTP, identificadores estables y mecanismo para desactivarlo en tests. Mantenerlo separado del repositorio de producción y evitar duplicarlo en reinicios dentro del mismo proceso.

Criterio: dominio probado sin Nest ni HTTP; almacenamiento aislado en cada test.

### Paso 4 — Tres operaciones verticales (60–100 min)

- Implementar en orden CreateShipment, GetShipment y AddCargoItem, cada uno con su adaptador HTTP.
- Mapear explícitamente DTO → entrada del caso de uso y resultado → respuesta.
- Validar UUID, cuerpo anidado, límites, cantidades, pertenencia del contenedor y presencia exacta de los dos documentos requeridos.
- Traducir errores del dominio/aplicación a HTTP en el adaptador, no dentro del núcleo.

Criterio: crear → agregar → consultar funciona; errores definidos son reproducibles.

### Paso 5 — OpenAPI y Swagger (100–115 min)

- Describir solicitudes, respuestas anidadas, enums, restricciones, ejemplos y errores reales.
- Publicar `/docs` y `/openapi.json`; exportar snapshot a docs.
- Revisar que Swagger permita completar el flujo y que no prometa endpoints inexistentes.

Criterio: contrato generado válido y coherente con el comportamiento observado.

### Paso 6 — Tests de integración (115–140 min)

- Jest + Supertest contra la app real con almacenamiento en memoria, sin mockear todos los casos de uso.
- Reutilizar la misma configuración de validación y errores del arranque.
- Cubrir flujo completo, entradas inválidas, recursos inexistentes, pertenencia y ausencia de cambios parciales.
- Probar dos altas de ítems concurrentes sobre el mismo contenedor si la implementación introduce asincronía.
- Aislar repositorios y desactivar seed en cada suite.

Criterio: build, lint y tests relevantes pasan; no perseguir un porcentaje arbitrario de cobertura.

### Paso 7 — Postman (140–155 min)

- Exportar colección local y entorno con baseUrl; sin credenciales ni dependencia de un workspace remoto.
- Secuencia autónoma: crear embarque, capturar shipmentId/containerId, agregar ítem, consultar y comprobar contenido.
- Añadir casos 400 y 404, incluido contenedor de otro embarque.
- Assertions de estado, IDs, pertenencia y valores; no limitarse a status 200/201.
- Usar variables capturadas, no IDs de una ejecución anterior. Ejecutar dos veces para comprobar independencia.
- Ejecutar con Postman CLI ya disponible: `postman collection run postman/Challenge.postman_collection.json -e postman/local.postman_environment.json`.

Criterio: colección importable, reproducible y ejecutada localmente contra la API.

### Paso 8 — Docker, README y entrega (155–180 min)

- Ejecutar build y arranque desde cero con `docker compose up --build`.
- Probar la colección contra el contenedor y revisar Swagger.
- Reiniciar y verificar pérdida de cambios; si hay seed, solo los ejemplos iniciales se restauran.
- No configurar volumen de base de datos: el almacenamiento es RAM.
- README de una página: comandos; modelado y decisiones; exclusiones; mejoras futuras; párrafo de IA; tiempo real y faltantes si existen.
- Incluir acceso a Swagger, ejecución de tests/Postman y comportamiento al reiniciar dentro de instrucciones breves.
- Revisar diff, secretos, lockfile y acceso del evaluador al repositorio cuando se prepare la entrega. No publicar ni enviar sin pedido.

Criterio: otra persona puede arrancar con Docker, probar y entender las limitaciones siguiendo el README.

## 7. Casos de aceptación prioritarios

1. Crear un embarque con dos contenedores y los dos documentos requeridos; consultar y verificar IDs, estado y arrays vacíos.
2. Rechazar creación sin contenedores, sin factura comercial o sin packing list.
3. Agregar un ítem al primer contenedor; el segundo permanece intacto.
4. Rechazar cantidad cero, negativa o fraccionaria; texto vacío; UUID inválido y propiedades no permitidas.
5. Rechazar un contenedor de otro embarque sin alterar ninguno de los dos.
6. Responder 404 a recursos inexistentes.
7. Rechazar creación inválida sin dejar embarques o contenedores parciales.
8. Rechazar tipos documentales desconocidos, duplicados o documentos con referencia vacía.
9. Mutar una copia obtenida del repositorio no modifica lo guardado.
10. Reiniciar elimina los cambios; la precarga vuelve a estar disponible.
11. Postman, Swagger y Docker funcionan con los mismos endpoints y contrato.

## 8. Flujo de trabajo con IA

Ask para aclarar dudas → Plan breve → Agent por operación vertical → ejecutar tests → revisión humana del diff → commit.

Las instrucciones estables deben ser breves, con referencias a archivos concretos. No duplicar este plan, el README y teoría de arquitectura dentro de cada prompt. Pedir cambios acotados, resultados de verificaciones y riesgos restantes. No generar abstracciones o dependencias adicionales sin necesidad concreta. Registrar contribuciones y correcciones reales para el párrafo de IA.

## 9. Fuentes técnicas

- [NestJS: custom providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS: OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [NestJS: testing](https://docs.nestjs.com/fundamentals/testing)
- [Postman CLI: ejecución de colecciones](https://learning.postman.com/docs/postman-cli/postman-cli-run-collection)

La consigna y el CV fueron analizados previamente en esta conversación. Las decisiones de este plan no agregan exigencias atribuidas a SIDOM.
