import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { type Request } from 'express';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { type SortOrder } from 'src/sorter/sorter.service';
import { Roles } from 'src/shared/decorators/set-role.decoratos';
import { ExtractUserId } from 'src/shared/decorators/extract-user-id.decorator';

@UseGuards(RolesGuard)
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Roles('operator')
  @Get('all')
  async getAll(
    @Query('q') q: string,
    @Query('order') order: SortOrder,
    @Query('sort_by') sortBy: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.ticketService.getAllTickets({ q, order, sortBy, page, limit });
  }

  @Get('')
  async getByUserId(
    @ExtractUserId() userId: string,
    @Query('q') q: string,
    @Query('q') order: SortOrder,
  ) {
    return await this.ticketService.geAllUserTickets(userId, { q, order });
  }

  @Post('')
  async createTicket(
    @Body() body: CreateTicketDto,
    @ExtractUserId() userId: string,
  ) {
    return await this.ticketService.createTicket(userId, body);
  }

  @Roles('operator')
  @Delete('')
  async delete() {
    return await this.ticketService.delete();
  }

  @Roles('operator')
  @Post('/complete/:id')
  async complete(@Param('id') id: number) {
    return await this.ticketService.completeTicket(id);
  }

  @Roles('operator')
  @Post('/reject/:id')
  async reject(@Param('id') id: number) {
    return await this.ticketService.rejectTicket(id);
  }

  @Roles('operator')
  @Get('/comparison')
  async comparison(
    @Query('quantity') quantity: number,
    @Query('algs') algs: string[] | string,
    @Query('order') order: SortOrder,
  ) {
    const algorithms = Array.isArray(algs) ? algs : [algs];

    return this.ticketService.comparisonTickets(quantity, order, algorithms);
  }
}
