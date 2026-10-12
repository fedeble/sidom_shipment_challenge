import { Module } from '@nestjs/common';

import { ShipmentsModule } from '../shipments/shipments.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ShipmentsModule],
  controllers: [HealthController],
})
export class HealthModule {}
