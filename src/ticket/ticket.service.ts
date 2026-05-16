import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SorterService, SortOrder } from 'src/sorter/sorter.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Prisma, TicketStatus } from '@prisma/client';

interface QueryParams {
  q?: string;
  order: SortOrder;
  sortBy?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sorter: SorterService,
  ) {}

  async getAllTickets(params: QueryParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const order = params.order;

    const where: Prisma.TicketWhereInput = {};

    if (params.q) {
      where.OR = [
        { type: { contains: params.q, mode: 'insensitive' } },
        { user: { firstName: { contains: params.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: params.q, mode: 'insensitive' } } },
        { VIN: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [rawTickets, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          VIN: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    const data = rawTickets.map(({ user, ...ticket }) => ({
      ...ticket,
      firstName: user?.firstName,
      lastName: user?.lastName,
    }));

    const sortedData = this.sorter.sort(data, 'heapSort', order);

    return {
      data: sortedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async geAllUserTickets(userId: string, params: QueryParams) {
    const where: Prisma.TicketWhereInput = {
      userId,
    };

    if (params?.q) {
      where.OR = [
        { type: { contains: params.q, mode: 'insensitive' } },
        { VIN: { contains: params.q, mode: 'insensitive' } },
        { user: { email: { contains: params.q, mode: 'insensitive' } } },
      ];
    }

    const status = params?.sortBy
      ? TicketStatus[params.sortBy as keyof typeof TicketStatus]
      : undefined;

    if (status) {
      where.status = status;
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const order = params?.order ?? 'desc';

    const [rawTickets, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    const sortedData = this.sorter.sort(rawTickets, 'heapSort', order);

    return {
      data: sortedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async createTicket(userId: string, dto: CreateTicketDto) {
    return await this.prisma.ticket.create({
      data: {
        type: dto.type,
        status: 'PENDING',
        VIN: dto.VIN,
        userId,
      },
    });
  }

  async delete() {
    return await this.prisma.ticket.deleteMany();
  }

  async completeTicket(id: number) {
    try {
      return await this.prisma.ticket.update({
        where: { id },
        data: {
          status: 'SUCCESS',
          completedAt: new Date(),
        },
      });
    } catch {
      throw new NotFoundException('Користувача з таким ID не існує.');
    }
  }

  async rejectTicket(id: number) {
    try {
      return await this.prisma.ticket.update({
        where: { id },
        data: { status: 'REJECT' },
      });
    } catch {
      throw new NotFoundException('Користувача з таким ID не існує.');
    }
  }

  async comparisonTickets(
    quantity: number,
    order: SortOrder = 'desc',
    algs: string[] = ['heapSort'],
  ) {
    const tickets = await this.prisma.ticket.findMany({
      take: quantity,
    });

    return algs.map((algorithm) => {
      const { time, operations } = this.sorter.sort(tickets, algorithm, order);
      return {
        total: tickets.length,
        result: { algorithm, time, operations },
      };
    });
  }
}
