import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContainerDto {
  @ApiProperty({ example: 'CONT-001', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  public reference!: string;
}
