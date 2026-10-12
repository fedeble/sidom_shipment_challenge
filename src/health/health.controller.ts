import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SHIPMENT_STORE, type ShipmentStore } from '../shipments/application/ports';

@Controller()
@ApiTags('health')
export class HealthController {
  constructor(@Inject(SHIPMENT_STORE) private readonly store: ShipmentStore) {}

  @Get('liveness')
  @ApiOperation({ summary: 'Comprobar que el proceso atiende requests' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  liveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Comprobar que la aplicación está lista' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  @ApiServiceUnavailableResponse({ description: 'El ShipmentStore no está disponible' })
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
