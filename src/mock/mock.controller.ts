import { Controller, Body, Post, Param } from '@nestjs/common';
import { MockService } from './mock.service';

@Controller('mock')
export class MockController {
  constructor(private readonly mockService: MockService) {}

  @Post('/generate/:id/:count')
  async generate(@Param('id') id: string, @Param('count') count: number) {
    return await this.mockService.fakerCreateTickets(id, count);
  }
}
