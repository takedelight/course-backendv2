import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TICKET_STATUS } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SorterService, SortOrder } from 'src/sorter/sorter.service';
import { STATUS_MAP } from 'src/shared/types/ticket.type';

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
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly sorter: SorterService,
  ) {}

  async getAllTickets(params: QueryParams) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const order = params.order;

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.user', 'user')
      .select([
        'ticket.id AS "id"',
        'ticket.type AS "type"',
        'ticket.VIN AS "vin"',
        'ticket.status AS "status"',
        'ticket.createdAt AS "createdAt"',
        'user.firstName AS "firstName"',
        'user.lastName AS "lastName"',
      ]);

    if (params.q) {
      qb.andWhere(
        `(ticket.type ILIKE :q OR user.firstName ILIKE :q OR user.lastName ILIKE :q)`,
        { q: `%${params.q}%` },
      );
    }

    const status = params.sortBy
      ? STATUS_MAP[params.sortBy as keyof typeof STATUS_MAP]
      : undefined;

    if (status) {
      qb.andWhere(`ticket.status = :status`, { status });
    }

    const total = await qb.getCount();

    qb.offset((page - 1) * limit).limit(limit);

    const data = await qb.getRawMany();

    const sortedData = this.sorter.sort(data, 'heapSort', order);

    return {
      data: sortedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async geAllUserTickets(userId: string, query?: string) {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.user', 'user')
      .where('user.id = :userId', { userId });

    if (query) {
      qb.andWhere(
        `CAST(ticket.id AS TEXT) ILIKE :q
   OR ticket.type ILIKE :q
   OR user.email ILIKE :q`,
        { q: `%${query}%` },
      );
    }

    return await qb.getMany();
  }

  async createTicket(userId: string, dto: CreateTicketDto) {
    const ticket = this.ticketRepository.create({
      type: dto.type,
      status: TICKET_STATUS.PENDING,
      VIN: dto.VIN,
      user: { id: userId },
    });
    return await this.ticketRepository.save(ticket);
  }

  async delete() {
    return await this.ticketRepository.clear();
  }

  async completeTicket(id: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const complitedTicket = {
      ...ticket,
      status: TICKET_STATUS.SUCCESS,
      completedAt: new Date(),
    };
    return await this.ticketRepository.save(complitedTicket);
  }

  async rejectTicket(id: number) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    const complitedTicket = {
      ...ticket,
      status: TICKET_STATUS.REJECT,
    };
    return await this.ticketRepository.save(complitedTicket);
  }

  async comparisonTickets(
    quantity: number,
    order: SortOrder = 'desc',
    algs: string[] = ['heapSort'],
  ) {
    const tickets = await this.ticketRepository.find({
      take: quantity,
    });

    const result = algs.map((algorithm) => {
      const { time, operations } = this.sorter.sort(tickets, algorithm, order);

      return {
        total: tickets.length,
        result: { algorithm, time, operations },
      };
    });

    return result;
  }
}
