import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';

import { SHIPMENT_STORE, type ShipmentStore } from '../shipments/application/ports';

@Controller()
export class HealthController {
  constructor(@Inject(SHIPMENT_STORE) private readonly store: ShipmentStore) {}

  @Get('liveness')
  liveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('readiness')
  readiness(): { status: 'ok' } {
    if (!this.store) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'Application is not ready',
      });
    }

    return { status: 'ok' };
  }
}
