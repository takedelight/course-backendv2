import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatementStatus, Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { Faker, uk } from '@faker-js/faker';

@Injectable()
export class TicketService {
  readonly faker: Faker;
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
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.faker = new Faker({ locale: uk });
  }

  async getAllTickets() {
    const tickets = await this.ticketRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      type: ticket.type,
      status: ticket.status,
      createdAt: ticket.createdAt,
      firstName: ticket.user.firstName,
      lastName: ticket.user.lastName,
    }));
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
}
