import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class AddCargoItemDto {
  @ApiProperty({ example: 'Repuestos industriales', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public description!: string;

  @ApiProperty({ example: 24, minimum: 1, maximum: 1000000 })
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  public quantity!: number;
}
