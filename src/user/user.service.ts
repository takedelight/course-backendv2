import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hash } from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';
import { Faker, uk } from '@faker-js/faker';

@Injectable()
export class UserService {
  readonly faker: Faker;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.faker = new Faker({ locale: uk });
  }

  private readonly select: FindOptionsSelect<User> = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    tickets: false,
    role: true,
    createdAt: true,
    updatedAt: true,
  };
  async getAll() {
    return await this.userRepository.find({
      select: this.select,
    });
  }

  async getByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        'Користувача з такою електроною поштою не існує',
      );
    }

    return user;
  }
  async getById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: this.select,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async delete(id: string) {
    const user = await this.getById(id);
    await this.userRepository.remove(user);

    return { message: 'Користувача видаленно.' };
  }

  async deleteMany(ids: string[]) {
    await this.userRepository.delete({ id: In(ids) });

    return { message: 'Користувачів видаленно.' };
  }

  async create(dto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: this.select,
    });

    if (user) {
      throw new ConflictException('Користувач з таким email вже існує.');
    }

    const newUser = this.userRepository.create({
      ...dto,
      password: await hash(dto.password),
    });
    return await this.userRepository.save(newUser);
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Користувача з таким id не існує.');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictException('Користувач з таким email вже існує.');
      }
    }

    const updated = this.userRepository.merge(user, dto);

    await this.userRepository.save(updated);

    return { message: 'Ваші данні оновлено.' };
  }
}
