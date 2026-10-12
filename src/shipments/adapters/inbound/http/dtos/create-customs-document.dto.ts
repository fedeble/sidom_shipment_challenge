import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { CustomsDocumentType } from '../../../../domain';

export class CreateCustomsDocumentDto {
  @ApiProperty({ enum: CustomsDocumentType, example: CustomsDocumentType.COMMERCIAL_INVOICE })
  @IsEnum(CustomsDocumentType)
  public type!: CustomsDocumentType;

  @ApiProperty({ example: 'INV-2026-001', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public reference!: string;
}
