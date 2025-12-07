import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { SorterService } from 'src/sorter/sorter.service';

@Module({
  controllers: [TicketController],
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketService, SorterService],
})
export class TicketModule {}
