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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiCreatedResponse({ type: ShipmentResponseDto })
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
  @ApiOkResponse({ type: ShipmentResponseDto })
  public get(
    @Param('shipmentId', new ParseUUIDPipe({ version: '4' })) shipmentId: string,
  ): ShipmentResponseDto {
    return toShipmentResponse(this.getShipment.execute(shipmentId));
  }

  @Post(':shipmentId/containers/:containerId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: CargoItemResponseDto })
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
