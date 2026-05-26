import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from '@prisma/client';
import { BinaryHeap } from 'src/shared/data-structures/binary-heap';
import { SortOrder } from 'src/shared/types/sorter.types';

interface QueryParams {
  q?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number | string;
  limit?: number | string;
}

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllCars(userId: string, params: QueryParams) {
    const order = params?.sortOrder ?? 'desc';
    const sortBy = params?.sortBy ?? 'createdAt';

    const cars = await this.prismaService.car.findMany({
      where: {
        userId,
      },
    });

    type CarItem = (typeof cars)[0];

    const compareFn = (a: CarItem, b: CarItem): number => {
      const valA = a[sortBy as keyof CarItem];
      const valB = b[sortBy as keyof CarItem];

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
    const heap = new BinaryHeap<CarItem>(compareFn, heapType);

    for (const car of cars) {
      heap.push(car);
    }

    return heap.toDto();
  }

  async create(userId: string, dto: CreateCarDto) {
    const isExist = await this.prismaService.car.findUnique({
      where: {
        vin: dto.vin,
      },
    });

    if (isExist) {
      throw new ConflictException('Авто з таким VIN вже існує');
    }

    return this.prismaService.car.create({
      data: {
        ...dto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async update(userId: string, carId: string, dto: UpdateCarDto) {
    const car = await this.prismaService.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException('Авто не знайдено');
    }

    if (car.userId !== userId) {
      throw new ForbiddenException(
        'У вас немає прав для редагування цього авто',
      );
    }

    const { modelName, ...restDto } = dto;

    return this.prismaService.car.update({
      where: { id: carId },
      data: {
        ...restDto,
        ...(modelName && { modelName: modelName }),
      },
    });
  }

  async delete(userId: string, carId: string) {
    const car = await this.prismaService.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException('Авто не знайдено');
    }

    if (car.userId !== userId) {
      throw new ForbiddenException('У вас немає прав для видалення цього авто');
    }

    await this.prismaService.car.delete({
      where: { id: carId },
    });

    return { success: true };
  }
}
