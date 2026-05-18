import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SorterService } from 'src/sorter/sorter.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Prisma, TicketStatus, Ticket } from '@prisma/client';
import { type SortOrder, type Algorithm } from 'src/shared/types/sorter.types';

interface QueryParams {
  q?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number | string;
  limit?: number | string;
}

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sorter: SorterService,
  ) {}

  async getAllTickets(params: QueryParams) {
    const page = params.page ? Number(params.page) : 1;
    const limit = params.limit ? Number(params.limit) : 10;
    const order = params.sortOrder ?? 'desc';
    const sortBy = (params.sortBy ?? 'createdAt') as keyof Ticket;

    const where: Prisma.TicketWhereInput = {};

    if (params.q) {
      where.OR = [
        { type: { contains: params.q, mode: 'insensitive' } },
        { user: { firstName: { contains: params.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: params.q, mode: 'insensitive' } } },
        { VIN: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    if (params.status && params.status !== '' && params.status !== 'all') {
      let normalizedStatus = params.status.toUpperCase();

      if (normalizedStatus === 'REJECTED') {
        normalizedStatus = 'REJECT';
      }

      if (normalizedStatus in TicketStatus) {
        where.status = normalizedStatus as TicketStatus;
      }
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
          userId: true,
          completedAt: true,
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

    const data = rawTickets.map((item) => ({
      ...item,
      firstName: item.user?.firstName,
      lastName: item.user?.lastName,
    }));

    const sortedResult = this.sorter.sort(data, {
      algorithm: 'heapSort',
      order,
      sortBy,
    });

    return {
      result: sortedResult,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async geAllUserTickets(userId: string, params: QueryParams) {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 10;
    const order = params?.sortOrder ?? 'desc';
    const sortBy = (params?.sortBy ?? 'createdAt') as keyof Ticket;

    const andConditions: Prisma.TicketWhereInput[] = [{ userId }];

    if (params?.q && params.q.trim() !== '') {
      andConditions.push({
        OR: [
          { type: { contains: params.q, mode: 'insensitive' } },
          { VIN: { contains: params.q, mode: 'insensitive' } },
          { user: { email: { contains: params.q, mode: 'insensitive' } } },
        ],
      });
    }

    if (params?.status && params.status !== '' && params.status !== 'all') {
      const mappedStatus = params.status.toUpperCase();
      if (mappedStatus in TicketStatus) {
        andConditions.push({
          status: mappedStatus as TicketStatus,
        });
      }
    }

    const where: Prisma.TicketWhereInput = { AND: andConditions };

    const [rawTickets, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    const sortedData = this.sorter.sort(rawTickets, {
      algorithm: 'heapSort',
      order,
      sortBy,
    });

    return {
      result: sortedData,
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
      throw new NotFoundException('Заявки з таким ID не існує.');
    }
  }

  async rejectTicket(id: number) {
    try {
      return await this.prisma.ticket.update({
        where: { id },
        data: { status: 'REJECT' },
      });
    } catch {
      throw new NotFoundException('Заявки з таким ID не існує.');
    }
  }

  async comparisonTickets(
    quantity: number,
    order: SortOrder = 'desc',
    algs: Algorithm[] = ['heapSort'],
  ) {
    const tickets = await this.prisma.ticket.findMany({
      take: quantity,
    });

    return algs.map((algorithm) => {
      const { time, operations } = this.sorter.sort(tickets, {
        algorithm: algorithm,
        order,
        sortBy: 'createdAt',
      });

      return {
        total: tickets.length,
        result: { algorithm, time, operations },
      };
    });
  }
}
