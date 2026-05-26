import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SorterService } from 'src/sorter/sorter.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Prisma, TicketStatus } from '@prisma/client';
import { type SortOrder, type Algorithm } from 'src/shared/types/sorter.types';
import { BinaryHeap } from 'src/shared/data-structures/binary-heap';

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
    const sortBy = params.sortBy ?? 'createdAt';

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
      if (normalizedStatus === 'REJECTED') normalizedStatus = 'REJECT';
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

    type TicketItem = (typeof rawTickets)[0];

    const compareFn = (a: TicketItem, b: TicketItem): number => {
      const valA = a[sortBy as keyof TicketItem];
      const valB = b[sortBy as keyof TicketItem];

      if (valA === null || valA === undefined) {
        if (valB === null || valB === undefined) return 0;
        return order === 'desc' ? -1 : 1;
      }
      if (valB === null || valB === undefined) {
        return order === 'desc' ? 1 : -1;
      }

      if (valA instanceof Date && valB instanceof Date) {
        return order === 'desc'
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }

      if (valA > valB) return order === 'desc' ? 1 : -1;
      if (valA < valB) return order === 'desc' ? -1 : 1;
      return 0;
    };

    const heapType = order === 'desc' ? 'MaxHeap' : 'MinHeap';

    const heap = new BinaryHeap<TicketItem>(compareFn, heapType);

    for (const ticket of rawTickets) {
      heap.push(ticket);
    }

    const heapDto = heap.toDto();

    return {
      result: heapDto,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async geAllUserTickets(userId: string, params: QueryParams) {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 10;
    const order = params?.sortOrder ?? 'desc';
    const sortBy = params?.sortBy ?? 'createdAt';

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
      }),
      this.prisma.ticket.count({ where }),
    ]);

    type TicketItem = (typeof rawTickets)[0];

    const compareFn = (a: TicketItem, b: TicketItem): number => {
      const valA = a[sortBy as keyof TicketItem];
      const valB = b[sortBy as keyof TicketItem];

      if (valA === null || valA === undefined) {
        if (valB === null || valB === undefined) return 0;
        return order === 'desc' ? -1 : 1;
      }
      if (valB === null || valB === undefined) {
        return order === 'desc' ? 1 : -1;
      }

      if (valA instanceof Date && valB instanceof Date) {
        return order === 'desc'
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }

      if (valA > valB) return order === 'desc' ? 1 : -1;
      if (valA < valB) return order === 'desc' ? -1 : 1;
      return 0;
    };

    const heapType = order === 'desc' ? 'MaxHeap' : 'MinHeap';
    const heap = new BinaryHeap<TicketItem>(compareFn, heapType);

    for (const ticket of rawTickets) {
      heap.push(ticket);
    }

    return {
      result: heap.toDto(),
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
        carId: dto.carId,
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
