import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Roles } from 'src/shared/decorators/set-role.decoratos';
import { ExtractUserId } from 'src/shared/decorators/extract-user-id.decorator';
import type { SortOrder, Algorithm } from 'src/shared/types/sorter.types';

@ApiTags('Заявки')
@UseGuards(RolesGuard)
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Roles('OPERATOR')
  @Get('/')
  @ApiOperation({ summary: 'Отримати всі заявки (лише оператор)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список заявок' })
  async getAll(
    @Query('q') q: string,
    @Query('status') status: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: SortOrder,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.ticketService.getAllTickets({
      q,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  @Get('my')
  @ApiOperation({ summary: 'Отримати заявки поточного користувача' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Список заявок користувача' })
  async getByUserId(
    @ExtractUserId() userId: string,
    @Query('q') q: string,
    @Query('status') status: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: SortOrder,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.ticketService.geAllUserTickets(userId, {
      q,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  @Post('')
  @ApiOperation({ summary: 'Створити заявку для поточного користувача' })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({ status: 201, description: 'Заявку створено' })
  async createTicket(
    @Body() body: CreateTicketDto,
    @ExtractUserId() userId: string,
  ) {
    return await this.ticketService.createTicket(userId, body);
  }

  @Roles('OPERATOR')
  @Delete('')
  @ApiOperation({ summary: 'Видалити всі заявки (лише оператор)' })
  @ApiResponse({ status: 200, description: 'Заявки видалено' })
  async delete() {
    return await this.ticketService.delete();
  }

  @Roles('OPERATOR')
  @Post('/complete/:id')
  @ApiOperation({ summary: 'Завершити заявку за id (лише оператор)' })
  @ApiResponse({ status: 200, description: 'Заявку завершено' })
  async complete(@Param('id') id: number) {
    return await this.ticketService.completeTicket(id);
  }

  @Roles('OPERATOR')
  @Post('/reject/:id')
  @ApiOperation({ summary: 'Відхилити заявку за id (лише оператор)' })
  @ApiResponse({ status: 200, description: 'Заявку відхилено' })
  async reject(@Param('id') id: number) {
    return await this.ticketService.rejectTicket(id);
  }

  @Roles('OPERATOR')
  @Get('/comparison')
  @ApiOperation({ summary: 'Порівняти алгоритми сортування (лише оператор)' })
  @ApiQuery({ name: 'quantity', required: true, example: 100 })
  @ApiQuery({ name: 'alg', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Результат порівняння' })
  async comparison(
    @Query('quantity') quantity: number,
    @Query('alg') algs: Algorithm[],
    @Query('order') order: SortOrder,
  ) {
    const algorithms = Array.isArray(algs) ? algs : [algs];
    return this.ticketService.comparisonTickets(quantity, order, algorithms);
  }
}
