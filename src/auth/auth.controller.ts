import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(
    @Body() dto: RegisterDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    return this.authService.register(dto, response, request);
  }
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    return this.authService.login(dto, response, request);
  }

  @UseGuards(JwtGuard)
  @UseGuards(RolesGuard)
  @Post('/logout')
  logout(@Res() response: Response) {
    return this.authService.logout(response);
  }
}
