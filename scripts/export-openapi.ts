import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApplication, createOpenApiDocument } from '../src/bootstrap';

async function exportOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApplication(app);

  const document = createOpenApiDocument(app);
  const outputPath = resolve(process.cwd(), 'docs', 'openapi.json');

  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();
}

exportOpenApi().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown OpenAPI export error';
  process.stderr.write(`OpenAPI export failed: ${message}\n`);
  process.exitCode = 1;
});
