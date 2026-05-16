import { Controller, Body, Post, Param } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MockService } from './mock.service';

@ApiTags('Мок-дані')
@Controller('mock')
export class MockController {
  constructor(private readonly mockService: MockService) {}

  @Post('/generate/:id/:count')
  @ApiOperation({ summary: 'Згенерувати тестові заявки для користувача' })
  @ApiResponse({ status: 201, description: 'Заявки згенеровано' })
  async generate(@Param('id') id: string, @Param('count') count: number) {
    return await this.mockService.fakerCreateTickets(id, count);
  }
}
