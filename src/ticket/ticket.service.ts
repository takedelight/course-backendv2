import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatementStatus, Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Faker, uk } from '@faker-js/faker';
import {
  SortAlgorithm,
  SorterService,
  SortResult,
} from 'src/sorter/sorter.service';
import { NormalizedTicket } from 'src/shared/types/ticket.type';

interface TicketRow {
  id: number;
  type: string;
  status: string;
  createdat: Date | string;
  firstname: string;
  lastname: string;
}

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

  async getAllTickets(
    q: string,
    order: string,
    sortBy: string,
    algorithms: SortAlgorithm[],
  ) {
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const STATUS_MAP: Record<string, string> = {
      pending: 'В обробці',
      completed: 'Виконано',
      rejected: 'Відхилено',
    };

    const status = STATUS_MAP[sortBy];

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.user', 'user')
      .select([
        'ticket.id AS id',
        'ticket.type AS type',
        'ticket.status AS status',
        'ticket.createdAt AS createdAt',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
      ]);

    if (q) {
      qb.andWhere(
        `ticket.type ILIKE :q
      OR user.firstName ILIKE :q
      OR user.lastName ILIKE :q`,
        { q: `%${q}%` },
      );
    }

    if (status) {
      qb.andWhere('ticket.status = :status', { status });
    }

    qb.orderBy('ticket.createdAt', sortOrder);

    const rows: TicketRow[] = await qb.getRawMany();

    const normalizedRows: NormalizedTicket[] = rows.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      createdAt: r.createdat,
      firstName: r.firstname,
      lastName: r.lastname,
    }));

    const results: Array<
      SortResult<NormalizedTicket> & { algorithm: SortAlgorithm }
    > = [];

    const sortOrderNormalized = order === 'asc' ? 'asc' : 'desc';

    for (const algorithm of algorithms) {
      const evaluated = this.sorter.sort(
        normalizedRows,
        algorithm,
        sortOrderNormalized,
      );

      results.push({
        algorithm,
        ...evaluated,
      });
    }

    return results;
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
      user: { id: userId },
    });
    return await this.ticketRepository.save(ticket);
  }

  async delete(id: number) {
    return await this.ticketRepository.delete(id);
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
      const status = this.faker.helpers.arrayElement(
        Object.values(StatementStatus),
      );

      const ticket = this.ticketRepository.create({
        type: this.faker.helpers.arrayElement(this.types),
        status,
        user: { id: userId },
        createdAt: this.faker.date.between({
          from: new Date('2024-05-01'),
          to: new Date('2025-11-04'),
        }),
      });

      await this.ticketRepository.save(ticket);
    }
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
}
