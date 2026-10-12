import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreateContainerDto } from './create-container.dto';
import { CreateCustomsDocumentDto } from './create-customs-document.dto';

export class CreateShipmentDto {
  @ApiProperty({ example: 'Buenos Aires, Argentina', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  public origin!: string;

  @ApiProperty({ example: 'Montevideo, Uruguay', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
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
