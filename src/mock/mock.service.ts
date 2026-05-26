import { Injectable } from '@nestjs/common';
import { Faker, uk } from '@faker-js/faker';
import { TICKET_TYPES } from 'src/shared/types/ticket.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { Car, Prisma, TicketStatus } from '@prisma/client';

@Injectable()
export class MockService {
  private readonly faker: Faker;

  constructor(private readonly prismaService: PrismaService) {
    this.faker = new Faker({ locale: uk });
  }

  async fakerCreateTickets(userId: string, count: number) {
    let userCars = await this.prismaService.car.findMany({
      where: { userId },
    });

    if (userCars.length < 5) {
      const mockCarsData = [
        { brand: 'Volkswagen', model: 'Passat', year: 2019 },
        { brand: 'BMW', model: 'X5', year: 2021 },
        { brand: 'Audi', model: 'A6', year: 2020 },
        { brand: 'Toyota', model: 'Camry', year: 2018 },
        { brand: 'Ford', model: 'Focus', year: 2017 },
        { brand: 'Mercedes-Benz', model: 'E-Class', year: 2022 },
        { brand: 'Renault', model: 'Megane', year: 2016 },
      ];

      const createdCars: Car[] = [];
      for (const car of mockCarsData) {
        const newCar = await this.prismaService.car.create({
          data: {
            brand: car.brand,
            modelName: car.model,
            year: car.year,
            vin: this.faker.string.alphanumeric({
              length: 17,
              casing: 'upper',
            }),
            plateNumber: this.faker.vehicle.vrm(),
            userId: userId,
          },
        });
        createdCars.push(newCar);
      }
      userCars = [...userCars, ...createdCars];
    }

    const ticketsToCreate: Prisma.TicketCreateManyInput[] = [];

    for (let i = 0; i < count; i++) {
      const randomCar = this.faker.helpers.arrayElement(userCars);

      ticketsToCreate.push({
        type: this.faker.helpers.arrayElement(TICKET_TYPES),
        status: TicketStatus.PENDING,
        VIN: randomCar.vin,
        userId: userId,
        carId: randomCar.id,
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
