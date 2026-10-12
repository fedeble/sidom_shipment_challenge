import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

import { MAX_ITEM_DESCRIPTION_LENGTH, MAX_ITEM_QUANTITY } from '../../../../domain';

export class AddCargoItemDto {
  @ApiProperty({
    example: 'Repuestos industriales',
    minLength: 1,
    maxLength: MAX_ITEM_DESCRIPTION_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(MAX_ITEM_DESCRIPTION_LENGTH)
  public description!: string;

  @ApiProperty({ example: 24, minimum: 1, maximum: MAX_ITEM_QUANTITY })
  @IsInt()
  @Min(1)
  @Max(MAX_ITEM_QUANTITY)
  public quantity!: number;
}
