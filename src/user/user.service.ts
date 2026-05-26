import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BinaryHeap } from 'src/shared/data-structures/binary-heap';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly select = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    tickets: false,
    role: true,
    createdAt: true,
    updatedAt: true,
  };

  constructor(private readonly prismaService: PrismaService) {}

  async getAll() {
    const users = await this.prismaService.user.findMany({
      select: this.select,
    });

    const heap = new BinaryHeap<Omit<User, 'password'>>(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      'MaxHeap',
    );

    for (const user of users) {
      heap.push(user);
    }

    return heap.toDto();
  }

  async getByEmail(email: string) {
    console.log(email);

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        'Користувача з такою електронною поштою не існує.',
      );
    }

    return user;
  }

  async getById(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: this.select,
    });

    if (!user) {
      throw new NotFoundException('Користувача з таким ID не існує.');
    }

    return user;
  }

  async delete(userId: string) {
    await this.prismaService.user.delete({
      where: { id: userId },
    });

    return { message: 'Користувача видалено.' };
  }

  async create(dto: CreateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      select: this.select,
    });

    if (user) {
      throw new ConflictException('Користувач з таким email вже існує.');
    }

    return await this.prismaService.user.create({
      data: {
        ...dto,
        password: await hash(dto.password),
      },
    });
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Користувача з таким ID не існує.');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictException('Користувач з таким email вже існує.');
      }
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...dto,
      },
    });

    return { message: 'Ваші дані оновлено.' };
  }
}
