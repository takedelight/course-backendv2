import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { verify } from 'argon2';
import { type Response } from 'express';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  private async validateUser(email: string, password: string) {
    const user = await this.userService.getByEmail(email);
    const isValid = await verify(user.password, password);

    if (!isValid) {
      throw new UnauthorizedException('Невірний пароль.');
    }

    return user;
  }

  async login(dto: LoginDto, response: Response) {
    const user = await this.validateUser(dto.email, dto.password);

    response.cookie('userId', user.id, {
      httpOnly: true,
      sameSite: 'lax',
    });

    response.json({ message: 'Успішний вхід.' });
  }

  async register(dto: RegisterDto, response: Response) {
    const user = await this.userService.create(dto);

    response.cookie('userId', user.id, {
      httpOnly: true,
      sameSite: 'lax',
    });

    response.json({ message: 'Успішна реєстрація.' });
  }

  logout(response: Response) {
    response.clearCookie('userId');
    response.json({ message: 'Успішний вихід.' });
  }
}
