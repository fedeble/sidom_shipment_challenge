import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { CustomsDocumentType, MAX_DOCUMENT_REFERENCE_LENGTH } from '../../../../domain';

export class CreateCustomsDocumentDto {
  @ApiProperty({ enum: CustomsDocumentType, example: CustomsDocumentType.COMMERCIAL_INVOICE })
  @IsEnum(CustomsDocumentType)
  public type!: CustomsDocumentType;

  @ApiProperty({ example: 'INV-2026-001', minLength: 1, maxLength: MAX_DOCUMENT_REFERENCE_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(MAX_DOCUMENT_REFERENCE_LENGTH)
  public reference!: string;
}
