import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreateContainerDto } from './create-container.dto';
import { CreateCustomsDocumentDto } from './create-customs-document.dto';
import { MAX_ORIGIN_DESTINATION_LENGTH } from '../../../../domain';

export class CreateShipmentDto {
  @ApiProperty({
    example: 'Buenos Aires, Argentina',
    minLength: 1,
    maxLength: MAX_ORIGIN_DESTINATION_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(MAX_ORIGIN_DESTINATION_LENGTH)
  public origin!: string;

  @ApiProperty({
    example: 'Montevideo, Uruguay',
    minLength: 1,
    maxLength: MAX_ORIGIN_DESTINATION_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(MAX_ORIGIN_DESTINATION_LENGTH)
  public destination!: string;

  @ApiProperty({ type: [CreateContainerDto], minItems: 1, maxItems: 50 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateContainerDto)
  public containers!: CreateContainerDto[];

  @ApiProperty({ type: [CreateCustomsDocumentDto], minItems: 2, maxItems: 2 })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateCustomsDocumentDto)
  public documents!: CreateCustomsDocumentDto[];
}
