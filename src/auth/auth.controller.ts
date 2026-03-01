import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { type Response } from 'express';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    return await this.authService.login(dto, response);
  }

  @Post('/register')
  async register(@Body() dto: RegisterDto, @Res() response: Response) {
    return await this.authService.register(dto, response);
  }

  @Post('/logout')
  logout(@Res() response: Response) {
    return this.authService.logout(response);
  }
}
