import { Injectable } from '@nestjs/common';
import { Faker, uk } from '@faker-js/faker';
import { TICKET_TYPES } from 'src/shared/types/ticket.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, TicketStatus } from '@prisma/client';

@Injectable()
export class MockService {
  private readonly faker: Faker;

  constructor(private readonly prismaService: PrismaService) {
    this.faker = new Faker({ locale: uk });
  }

  async fakerCreateTickets(userId: string, count: number) {
    const ticketsToCreate: Prisma.TicketCreateManyInput[] = [];

    for (let i = 0; i < count; i++) {
      ticketsToCreate.push({
        type: this.faker.helpers.arrayElement(TICKET_TYPES),
        status: TicketStatus.PENDING,
        VIN: this.faker.string.alphanumeric({
          length: 17,
          casing: 'upper',
        }),
        userId: userId,
        createdAt: this.faker.date.between({
          from: new Date('2025-12-01'),
          to: new Date('2026-05-14'),
        }),
      });
    }

    await this.prismaService.ticket.createMany({
      data: ticketsToCreate,
    });
  }
}
