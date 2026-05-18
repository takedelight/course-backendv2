import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/set-role.decoratos';
import { type Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ExtractUserId } from 'src/shared/decorators/extract-user-id.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@ApiTags('Користувачі')
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @ApiOperation({ summary: 'Отримати всіх користувачів (лише оператор)' })
  @ApiResponse({ status: 200, description: 'Список користувачів' })
  @Roles('OPERATOR')
  @UseGuards(RolesGuard)
  async getAll() {
    return await this.userService.getAll();
  }

  @Get('/me')
  @ApiOperation({ summary: 'Отримати профіль поточного користувача' })
  @ApiResponse({ status: 200, description: 'Дані поточного користувача' })
  async getUserById(@ExtractUserId() userId: string) {
    return await this.userService.getById(userId);
  }

  @Patch('/update/:id')
  @ApiOperation({ summary: 'Оновити користувача за id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Користувача оновлено' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.userService.update(id, dto);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Видалити користувача за id' })
  @ApiResponse({ status: 200, description: 'Користувача видалено' })
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }

  @Roles('OPERATOR')
  @Post('/create')
  @ApiOperation({ summary: 'Створити користувача (лише оператор)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Користувача створено' })
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }
}
