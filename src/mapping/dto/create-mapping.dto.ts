import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateMappingDto {
  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'id1 must not be blank' })
  @MaxLength(255)
  id1!: string;

  @ApiProperty({ example: 'XYZ456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'id2 must not be blank' })
  @MaxLength(255)
  id2!: string;
}
