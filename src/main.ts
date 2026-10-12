import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApplication, createLogger, getRuntimeConfig, seedStore } from './bootstrap';
import { SHIPMENT_STORE } from './shipments/application/ports';
import type { ShipmentStore } from './shipments/application/ports';

async function bootstrap(): Promise<void> {
  const config = getRuntimeConfig(process.env);
  const app = await NestFactory.create(AppModule, {
    logger: createLogger(config),
  });

  configureApplication(app);
  const store = app.get<ShipmentStore>(SHIPMENT_STORE);
  seedStore(store, config.seedEnabled);
  await app.listen(config.port, '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown bootstrap error';
  process.stderr.write(`Application failed to start: ${message}\n`);
  process.exitCode = 1;
});
