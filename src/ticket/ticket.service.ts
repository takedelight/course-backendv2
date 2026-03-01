import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatementStatus, Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Faker, uk } from '@faker-js/faker';
import { SorterService, SortOrder } from 'src/sorter/sorter.service';

@Injectable()
export class TicketService {
  readonly faker: Faker;
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly sorter: SorterService,
  ) {
    this.faker = new Faker({ locale: uk });
  }

  private readonly types = [
    'Реєстрація авто',
    'Перереєстрація авто',
    'Зняття з обліку',
    'Отримання номерів',
    'Видача дубліката техпаспорта',
    'Заміна водійського посвідчення',
    'Отримання довідки про технічний стан',
    'Заміна номерних знаків',
  ];

  async getAllTickets(
    q?: string,
    order?: SortOrder,
    sortBy?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.user', 'user')
      .select([
        'ticket.id AS "id"',
        'ticket.type AS "type"',
        'ticket.status AS "status"',
        'ticket.createdAt AS "createdAt"',
        'user.firstName AS "firstName"',
        'user.lastName AS "lastName"',
      ]);

    if (q) {
      qb.andWhere(
        `(ticket.type ILIKE :q OR user.firstName ILIKE :q OR user.lastName ILIKE :q)`,
        { q: `%${q}%` },
      );
    }

    const STATUS_MAP = {
      completed: 'Виконано',
      rejected: 'Відхилено',
      pending: 'В обробці',
    } as const;

    const status = sortBy
      ? STATUS_MAP[sortBy as keyof typeof STATUS_MAP]
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

  async createTicket(dto: CreateTicketDto, userId: string) {
    const ticket = this.ticketRepository.create({
      type: dto.type,
      status: StatementStatus.PENDING,
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
      order: { createdAt: 'DESC' },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    const complitedTicket = {
      ...ticket,
      status: StatementStatus.SUCCESS,
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
      status: StatementStatus.REJECT,
      completedAt: new Date(),
    };
    return await this.ticketRepository.save(complitedTicket);
  }

  async fakerCreateTickets(userId: string, count: number) {
    for (let i = 0; i < count; i++) {
      const ticket = this.ticketRepository.create({
        type: this.faker.helpers.arrayElement(this.types),
        status: StatementStatus.PENDING,
        user: { id: userId },
        createdAt: this.faker.date.between({
          from: new Date('2025-12-01'),
          to: new Date('2026-1-20'),
        }),
      });

      await this.ticketRepository.save(ticket);
    }
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
