import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [TicketController],
  imports: [TypeOrmModule.forFeature([Ticket, User])],
  providers: [TicketService],
})
export class TicketModule {}
