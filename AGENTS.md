# Instrucciones del agente — Challenge SIDOM

## Fuente obligatoria de trabajo

Antes de analizar, modificar o verificar cualquier archivo, leer siempre `PLAN_IMPLEMENTACION.md` completo y basar el trabajo en sus decisiones, alcance, arquitectura, contrato HTTP, criterios de aceptacion y pasos de implementacion. El plan es la fuente principal de verdad del proyecto; si surge una duda o una decision no contemplada, detenerse y registrar el supuesto en el plan o en el README antes de implementar. No agregar requisitos, endpoints, dependencias o infraestructura que contradigan el plan sin una decision explicita del usuario.

## Objetivo

Implementar la API según `PLAN_IMPLEMENTACION.md`, respetando Node.js `24.21.0`, NestJS, TypeScript, arquitectura hexagonal, almacenamiento en memoria, Docker, OpenAPI/Swagger, Jest y Postman.

## Ahorro de tokens y contexto

- Leer primero `PLAN_IMPLEMENTACION.md` y solo los archivos directamente relacionados con la tarea.
- No leer todo el repositorio por defecto. Usar búsquedas acotadas por ruta, símbolo o patrón.
- No releer archivos sin cambios ni repetir búsquedas ya realizadas.
- Antes de abrir un archivo, verificar que sea necesario para la decisión actual.
- No incluir `node_modules`, `dist`, logs, snapshots grandes ni fixtures no relacionados.
- Preferir diffs pequeños, resúmenes breves y una modificación coherente por iteración.
- No duplicar el plan, README o contrato OpenAPI en prompts y comentarios.

## Reglas técnicas

- Mantener dependencias HTTP → aplicación → dominio.
- Usar DTOs en HTTP; no pasar DTOs al dominio.
- Inyectar puertos mediante tokens NestJS; los casos de uso no dependen del adaptador concreto.
- Mantener `Shipment` como raíz del agregado.
- Todo embarque requiere al menos un contenedor, una factura comercial y un packing list.
- No agregar persistencia, autenticación, archivos, microservicios ni endpoints fuera del plan sin decisión explícita.

## Alcance de trabajo

- Implementar únicamente las tres operaciones definidas en el plan: crear, consultar y agregar un ítem.
- Tratar `Shipment` como agregado completo y el almacenamiento en memoria como singleton por proceso.
- Mantener la dirección de dependencias `HTTP → aplicación → dominio`; el adaptador en memoria implementa un puerto de aplicación.
- Registrar primero en `PLAN_IMPLEMENTACION.md` cualquier decisión no contemplada que cambie contrato, modelo, dependencias o infraestructura.

## Comandos del proyecto

Una vez creado el proyecto en el paso 2, conservar scripts npm para estas comprobaciones y preferirlos sobre comandos ad hoc:

- `npm run build`: compilar TypeScript.
- `npm run lint`: ejecutar el análisis estático.
- `npm run test`: ejecutar tests unitarios.
- `npm run test:e2e`: ejecutar integración HTTP.
- `npm run openapi:export`: actualizar `docs/openapi.json` desde la aplicación.
- `docker compose up --build`: construir y arrancar la imagen final.
- `postman collection run postman/Challenge.postman_collection.json -e postman/local.postman_environment.json`: ejecutar la colección local.

Si durante el scaffolding cambia justificadamente un nombre de script, actualizar esta sección y el README en la misma iteración.

## Verificación

- Ejecutar después de cada cambio solo las comprobaciones afectadas.
- Antes de entregar, ejecutar build, lint, Jest, Docker y Postman según los scripts disponibles.
- Informar comandos, resultado y limitaciones.
- No inventar requisitos del dominio; registrar supuestos en el plan o README.

## Criterio de finalización

Una tarea está terminada cuando el cambio cumple el paso correspondiente del plan, pasan las comprobaciones afectadas y no quedan archivos generados o decisiones sin documentar. La entrega completa requiere build, lint, Jest unitario y HTTP, exportación OpenAPI actualizada, arranque con Docker y colección Postman ejecutada contra el contenedor. La revisión humana final del diff y del registro de uso de IA permanece explícitamente a cargo del responsable de la entrega.
