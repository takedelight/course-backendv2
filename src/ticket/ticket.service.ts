import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
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
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      type: ticket.type,
      isComplete: ticket.isComplete,
      completedAt: ticket.completedAt,
      createdAt: ticket.createdAt,
      firstName: ticket.user.firstName,
      lastName: ticket.user.lastName,
    }));
  }

  async geAllUserTickets(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const tickets = await this.ticketRepository.find({
      where: { user: { id: userId } },
    });

    return {
      firstName: user?.firstName,
      lastName: user?.lastName,
      tickets,
    };
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
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    const complitedTicket = {
      ...ticket,
      isComplete: true,
      completedAt: new Date(),
    };
    return await this.ticketRepository.save(complitedTicket);
  }

  async fakerCreateTickets(userId: string, count: number) {
    for (let i = 0; i < count; i++) {
      const completedAt = Math.random() < 0.5 ? this.faker.date.past() : null;
      const ticket = this.ticketRepository.create({
        type: this.faker.helpers.arrayElement(this.types),
        isComplete: this.faker.datatype.boolean(),
        completedAt,
        user: { id: userId },
        createdAt: this.faker.date.between({
          from: String(new Date('2000-05-01')),
          to: String(new Date('2025-11-04')),
        }),
      });
      await this.ticketRepository.save(ticket);
    }
  }
}
