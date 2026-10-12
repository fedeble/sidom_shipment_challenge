import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const options = new DocumentBuilder()
    .setTitle('Challenge SIDOM - Shipments API')
    .setDescription(
      'API local para gestionar embarques, contenedores, ítems y documentos aduaneros como metadatos.',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Desarrollo local')
    .setExternalDoc('Guía del proyecto', 'https://github.com/sidom/challenge-embarque#readme')
    .addTag('shipments', 'Operaciones sobre el agregado Shipment')
    .addTag('health', 'Endpoints operativos')
    .build();

  return SwaggerModule.createDocument(app, options);
}

export function setupOpenApi(app: INestApplication): void {
  const document = createOpenApiDocument(app);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'openapi.json',
    customSiteTitle: 'Challenge SIDOM API',
  });
}
