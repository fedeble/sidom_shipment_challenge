import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SHIPMENT_STORE, type ShipmentStore } from '../shipments/application/ports';

@Controller()
@ApiTags('health')
export class HealthController {
  constructor(@Inject(SHIPMENT_STORE) private readonly store: ShipmentStore) {}

  @Get('liveness')
  @ApiOperation({
    operationId: 'getLiveness',
    summary: 'Comprobar disponibilidad del proceso',
    description: 'Confirma que el proceso está atendiendo solicitudes.',
    security: [],
  })
  @ApiOkResponse({
    description: 'El proceso está disponible.',
    schema: { example: { status: 'ok' } },
  })
  @ApiResponse({ status: 500, description: 'El proceso no pudo atender la solicitud.' })
  liveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('readiness')
  @ApiOperation({
    operationId: 'getReadiness',
    summary: 'Comprobar preparación de la aplicación',
    description: 'Confirma que NestJS y el almacenamiento en memoria están disponibles.',
    security: [],
  })
  @ApiOkResponse({
    description: 'La aplicación está lista.',
    schema: { example: { status: 'ok' } },
  })
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
