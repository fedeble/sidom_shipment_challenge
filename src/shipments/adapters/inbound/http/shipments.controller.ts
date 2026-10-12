import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  AddCargoItemUseCase,
  CreateShipmentUseCase,
  GetShipmentUseCase,
  ListShipmentsUseCase,
} from '../../../application';
import { toShipmentResponse } from './shipment-response.mapper';
import {
  AddCargoItemDto,
  CargoItemResponseDto,
  CreateShipmentDto,
  ErrorResponseDto,
  ShipmentResponseDto,
  ListShipmentsQueryDto,
  ShipmentListResponseDto,
} from './dtos';

@ApiTags('shipments')
@Controller('shipments')
export class ShipmentsController {
  public constructor(
    private readonly createShipment: CreateShipmentUseCase,
    private readonly getShipment: GetShipmentUseCase,
    private readonly addCargoItem: AddCargoItemUseCase,
    private readonly listShipments: ListShipmentsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createShipment',
    summary: 'Crear un embarque',
    description:
      'Crea un embarque en memoria con contenedores y exactamente una factura comercial y un packing list.',
    security: [],
  })
  @ApiBody({
    type: CreateShipmentDto,
    examples: {
      shipment: {
        value: {
          origin: 'Buenos Aires, Argentina',
          destination: 'Montevideo, Uruguay',
          containers: [{ reference: 'CONT-001' }],
          documents: [
            { type: 'COMMERCIAL_INVOICE', reference: 'INV-2026-001' },
            { type: 'PACKING_LIST', reference: 'PL-2026-001' },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Embarque creado con estado CREATED.',
    type: ShipmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'El cuerpo no cumple las validaciones o reglas de negocio.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error inesperado sin detalles internos.',
    type: ErrorResponseDto,
  })
  public create(@Body() body: CreateShipmentDto): ShipmentResponseDto {
    const snapshot = this.createShipment.execute({
      origin: body.origin,
      destination: body.destination,
      containers: body.containers.map((container) => ({ reference: container.reference })),
      documents: body.documents.map((document) => ({
        type: document.type,
        reference: document.reference,
      })),
    });

    return toShipmentResponse(snapshot);
  }

  @Get(':shipmentId')
  @ApiOperation({
    operationId: 'getShipment',
    summary: 'Consultar un embarque',
    description: 'Devuelve el agregado completo, incluidos contenedores, ítems y documentos.',
    security: [],
  })
  @ApiParam({ name: 'shipmentId', format: 'uuid', description: 'UUID v4 del embarque' })
  @ApiOkResponse({ description: 'Embarque encontrado.', type: ShipmentResponseDto })
  @ApiBadRequestResponse({
    description: 'El identificador no es un UUID v4 válido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No existe un embarque con ese identificador.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error inesperado sin detalles internos.',
    type: ErrorResponseDto,
  })
  public get(
    @Param('shipmentId', new ParseUUIDPipe({ version: '4' })) shipmentId: string,
  ): ShipmentResponseDto {
    return toShipmentResponse(this.getShipment.execute(shipmentId));
  }

  @Get()
  @ApiOperation({
    operationId: 'listShipments',
    summary: 'Listar embarques',
    description: 'Devuelve embarques almacenados en memoria, con filtro opcional y paginación.',
    security: [],
  })
  @ApiOkResponse({ description: 'Página de embarques.', type: ShipmentListResponseDto })
  @ApiBadRequestResponse({ description: 'Los parámetros no son válidos.', type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({
    description: 'Error inesperado sin detalles internos.',
    type: ErrorResponseDto,
  })
  public list(@Query() query: ListShipmentsQueryDto): ShipmentListResponseDto {
    const result = this.listShipments.execute({
      status: query.status,
      limit: query.limit,
      size: query.size,
    });
    return {
      data: result.data.map(toShipmentResponse),
      total: result.total,
      limit: query.limit,
      size: query.size,
    };
  }

  @Post(':shipmentId/containers/:containerId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'addCargoItem',
    summary: 'Agregar un ítem',
    description: 'Agrega un ítem al contenedor indicado y valida su pertenencia al embarque.',
    security: [],
  })
  @ApiBody({
    type: AddCargoItemDto,
    examples: { item: { value: { description: 'Repuestos industriales', quantity: 24 } } },
  })
  @ApiParam({ name: 'shipmentId', format: 'uuid', description: 'UUID v4 del embarque' })
  @ApiParam({ name: 'containerId', format: 'uuid', description: 'UUID v4 del contenedor' })
  @ApiCreatedResponse({ description: 'Ítem agregado al contenedor.', type: CargoItemResponseDto })
  @ApiBadRequestResponse({
    description: 'El cuerpo o un identificador no es válido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No existe el embarque o el contenedor no le pertenece.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error inesperado sin detalles internos.',
    type: ErrorResponseDto,
  })
  public addItem(
    @Param('shipmentId', new ParseUUIDPipe({ version: '4' })) shipmentId: string,
    @Param('containerId', new ParseUUIDPipe({ version: '4' })) containerId: string,
    @Body() body: AddCargoItemDto,
  ): CargoItemResponseDto {
    return this.addCargoItem.execute({
      shipmentId,
      containerId,
      description: body.description,
      quantity: body.quantity,
    });
  }
}
