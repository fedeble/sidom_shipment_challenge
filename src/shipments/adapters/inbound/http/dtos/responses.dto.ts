import { ApiProperty } from '@nestjs/swagger';

import { CustomsDocumentType, ShipmentStatus } from '../../../../domain';

export class CargoItemResponseDto {
  @ApiProperty({ format: 'uuid', description: 'UUID v4 generado por el servidor.' })
  public id!: string;

  @ApiProperty({ description: 'Descripción del ítem.' })
  public description!: string;

  @ApiProperty({ description: 'Cantidad de unidades.' })
  public quantity!: number;
}

export class ContainerResponseDto {
  @ApiProperty({ format: 'uuid', description: 'UUID v4 del contenedor.' })
  public id!: string;

  @ApiProperty({ description: 'Referencia externa del contenedor.' })
  public reference!: string;

  @ApiProperty({ type: [CargoItemResponseDto] })
  public items!: CargoItemResponseDto[];
}

export class CustomsDocumentResponseDto {
  @ApiProperty({ format: 'uuid', description: 'UUID v4 del documento.' })
  public id!: string;

  @ApiProperty({ enum: CustomsDocumentType })
  public type!: CustomsDocumentType;

  @ApiProperty({ description: 'Referencia del documento aduanero.' })
  public reference!: string;
}

export class ShipmentResponseDto {
  @ApiProperty({ format: 'uuid', description: 'UUID v4 del embarque.' })
  public id!: string;

  @ApiProperty({ description: 'Lugar de origen.' })
  public origin!: string;

  @ApiProperty({ description: 'Lugar de destino.' })
  public destination!: string;

  @ApiProperty({ enum: ShipmentStatus, description: 'Estado asignado por el servidor.' })
  public status!: ShipmentStatus;

  @ApiProperty({ type: [ContainerResponseDto] })
  public containers!: ContainerResponseDto[];

  @ApiProperty({ type: [CustomsDocumentResponseDto] })
  public documents!: CustomsDocumentResponseDto[];
}

export class ShipmentListResponseDto {
  @ApiProperty({ type: [ShipmentResponseDto] })
  public data!: ShipmentResponseDto[];

  @ApiProperty()
  public total!: number;

  @ApiProperty()
  public limit!: number;

  @ApiProperty()
  public size!: number;
}
