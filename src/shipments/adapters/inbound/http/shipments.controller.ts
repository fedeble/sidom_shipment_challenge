import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
} from '../../../application';
import { toShipmentResponse } from './shipment-response.mapper';
import {
  AddCargoItemDto,
  CargoItemResponseDto,
  CreateShipmentDto,
  ErrorResponseDto,
  ShipmentResponseDto,
} from './dtos';

@ApiTags('shipments')
@Controller('shipments')
export class ShipmentsController {
  public constructor(
    private readonly createShipment: CreateShipmentUseCase,
    private readonly getShipment: GetShipmentUseCase,
    private readonly addCargoItem: AddCargoItemUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un embarque con contenedores y documentos obligatorios' })
  @ApiCreatedResponse({ type: ShipmentResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
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
  @ApiOperation({ summary: 'Consultar un embarque completo' })
  @ApiParam({ name: 'shipmentId', format: 'uuid', description: 'UUID v4 del embarque' })
  @ApiOkResponse({ type: ShipmentResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  public get(
    @Param('shipmentId', new ParseUUIDPipe({ version: '4' })) shipmentId: string,
  ): ShipmentResponseDto {
    return toShipmentResponse(this.getShipment.execute(shipmentId));
  }

  @Post(':shipmentId/containers/:containerId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar un ítem a un contenedor del embarque' })
  @ApiParam({ name: 'shipmentId', format: 'uuid', description: 'UUID v4 del embarque' })
  @ApiParam({ name: 'containerId', format: 'uuid', description: 'UUID v4 del contenedor' })
  @ApiCreatedResponse({ type: CargoItemResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
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
