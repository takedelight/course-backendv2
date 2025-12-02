import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
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

  async getAll() {
    return await this.userRepository.find({
      select: [
        'createdAt',
        'email',
        'id',
        'firstName',
        'updatedAt',
        'lastName',
        'role',
      ],
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
      select: [
        'createdAt',
        'email',
        'id',
        'firstName',
        'updatedAt',
        'lastName',
        'role',
      ],
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
      select: [
        'createdAt',
        'email',
        'id',
        'firstName',
        'updatedAt',
        'lastName',
        'role',
      ],
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

  async generateUsers(count: number, password: string) {
    for (let i = 0; i < 100; i++) {
      const user = this.userRepository.create({
        email: this.faker.internet.email().toLowerCase(),
        firstName: this.faker.person.firstName(),
        lastName: this.faker.person.lastName(),
        role: UserRole.USER,
        password: await hash(password),
        createdAt: this.faker.date.between({
          from: new Date('2024-01-01'),
          to: new Date('2025-11-04'),
        }),
      });
      await this.userRepository.save(user);
    }

    // return {
    //   message: `Користувачів у кількості ${users.length} успішно згенеровано`,
    // };
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

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

    await this.userRepository.update(userId, { ...dto });

    return { message: 'Ваші данні оновлено.' };
  }
}
