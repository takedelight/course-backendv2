import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { type Response } from 'express';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Автентифікація')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'Вхід користувача' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Вхід успішний' })
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    return await this.authService.login(dto, response);
  }

  @Post('/register')
  @ApiOperation({ summary: 'Реєстрація користувача' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Реєстрація успішна' })
  async register(@Body() dto: RegisterDto, @Res() response: Response) {
    return await this.authService.register(dto, response);
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Вихід користувача' })
  @ApiResponse({ status: 200, description: 'Вихід успішний' })
  logout(@Res() response: Response) {
    return this.authService.logout(response);
  }
}
