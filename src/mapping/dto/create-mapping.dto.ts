import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMappingDto {
  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  id1!: string;

  @ApiProperty({ example: 'XYZ456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  id2!: string;
}
