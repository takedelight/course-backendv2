import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAll() {
    return await this.userRepository.find({ select: { password: false } });
  }

  async getByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async getById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async delete(id: string) {
    const user = await this.getById(id);
    return await this.userRepository.remove(user);
  }

  async create(dto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    console.log(dto);

    if (user) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = this.userRepository.create({
      ...dto,
      password: await hash(dto.password),
    });
    return await this.userRepository.save(newUser);
  }
}
