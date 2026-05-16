import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

import { SorterService } from 'src/sorter/sorter.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService, SorterService],
})
export class TicketModule {}
