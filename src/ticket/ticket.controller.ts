import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/set-role.decoratos';
import { type Request } from 'express';
import { CreateTicketDto } from './dto/create-ticket.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}
  c;

  @Roles('operator')
  @Get('/all')
  async getAll() {
    return await this.ticketService.getAllTickets();
  }

  @Get('')
  async getByUserId(@Req() request: Request, @Query('q') query: string) {
    return await this.ticketService.geAllUserTickets(request.user.sub, query);
  }

  @Post('')
  async createTicket(@Body() body: CreateTicketDto, @Req() request: Request) {
    return await this.ticketService.createTicket(body, request.user.sub);
  }

  @Post('/generate/:id/:count')
  async generate(
    @Param('id') id: string,
    @Param('count', ParseIntPipe) count: number,
  ) {
    return this.ticketService.fakerCreateTickets(id, count);
  }

  @Roles('operator')
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return await this.ticketService.delete(id);
  }

  @Roles('operator')
  @Delete('/:id')
  async complete(@Param('id') id: number) {
    return await this.ticketService.completeTicket(id);
  }
}
