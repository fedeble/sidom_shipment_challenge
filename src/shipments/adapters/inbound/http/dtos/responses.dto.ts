import { ApiProperty } from '@nestjs/swagger';

import { CustomsDocumentType, ShipmentStatus } from '../../../../domain';

export class CargoItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty()
  public description!: string;

  @ApiProperty()
  public quantity!: number;
}

export class ContainerResponseDto {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty()
  public reference!: string;

  @ApiProperty({ type: [CargoItemResponseDto] })
  public items!: CargoItemResponseDto[];
}

export class CustomsDocumentResponseDto {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty({ enum: CustomsDocumentType })
  public type!: CustomsDocumentType;

  @ApiProperty()
  public reference!: string;
}

export class ShipmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  public id!: string;

  @ApiProperty()
  public origin!: string;

  @ApiProperty()
  public destination!: string;

  @ApiProperty({ enum: ShipmentStatus })
  public status!: ShipmentStatus;

  @ApiProperty({ type: [ContainerResponseDto] })
  public containers!: ContainerResponseDto[];

  @ApiProperty({ type: [CustomsDocumentResponseDto] })
  public documents!: CustomsDocumentResponseDto[];
}
