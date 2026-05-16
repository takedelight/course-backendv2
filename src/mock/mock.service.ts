import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TICKET_STATUS } from 'src/ticket/entities/ticket.entity';
import { Faker, uk } from '@faker-js/faker';
import { TICKET_TYPES } from 'src/shared/types/ticket.type';

@Injectable()
export class MockService {
  private readonly faker: Faker;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {
    this.faker = new Faker({ locale: uk });
  }

  async fakerCreateTickets(userId: string, count: number) {
    const ticketsToCreate: Ticket[] = [];

    for (let i = 0; i < count; i++) {
      const ticket = this.ticketRepository.create({
        type: this.faker.helpers.arrayElement(TICKET_TYPES),
        status: TICKET_STATUS.PENDING,
        VIN: this.faker.string.alphanumeric({
          length: 17,
          casing: 'upper',
        }),
        user: { id: userId },
        createdAt: this.faker.date.between({
          from: new Date('2025-12-01'),
          to: new Date('2026-1-20'),
        }),
      });

      ticketsToCreate.push(ticket);
    }

    await this.ticketRepository.save(ticketsToCreate);
  }
}
