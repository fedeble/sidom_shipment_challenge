import { Module } from '@nestjs/common';

import { ShipmentsModule } from './shipments/shipments.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ShipmentsModule, HealthModule],
})
export class AppModule {}
