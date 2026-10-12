import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { MAX_CONTAINER_REFERENCE_LENGTH } from '../../../../domain';

export class CreateContainerDto {
  @ApiProperty({ example: 'CONT-001', minLength: 1, maxLength: MAX_CONTAINER_REFERENCE_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(MAX_CONTAINER_REFERENCE_LENGTH)
  public reference!: string;
}
