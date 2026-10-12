import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  public statusCode!: number;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  public code!: string;

  @ApiProperty({ example: 'Request validation failed' })
  public message!: string;

  @ApiPropertyOptional({ type: [String], example: ['origin must not be empty'] })
  public details?: string[];
}
