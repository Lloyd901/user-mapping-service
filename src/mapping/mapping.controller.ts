import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMappingDto } from './dto/create-mapping.dto';
import { MappingService, UserIDResponse } from './mapping.service';

@ApiTags('user-mappings')
@Controller('user-mappings')
export class MappingController {
  constructor(private readonly service: MappingService) {}

  @Post()
  @ApiOperation({ summary: 'Resolve a stable user ID for an id1/id2 pair' })
  @ApiOkResponse({ schema: { example: { userID: '550e8400-e29b-41d4-a716-446655440000' } } })
  @ApiBadRequestResponse({ description: 'The request body is invalid.' })
  resolve(@Body() dto: CreateMappingDto): Promise<UserIDResponse> {
    return this.service.resolve(dto);
  }
}
