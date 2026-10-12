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

## Verificación

- Ejecutar después de cada cambio solo las comprobaciones afectadas.
- Antes de entregar, ejecutar build, lint, Jest, Docker y Postman según los scripts disponibles.
- Informar comandos, resultado y limitaciones.
- No inventar requisitos del dominio; registrar supuestos en el plan o README.
