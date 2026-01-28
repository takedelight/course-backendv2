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
import { UserService } from './user.service';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/set-role.decoratos';
import { type Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ExtractUserId } from 'src/shared/decorators/extract-user-id.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @Roles('operator')
  async getAll() {
    return await this.userService.getAll();
  }

  @Get('/me')
  async getUserById(@ExtractUserId() userId: string) {
    return await this.userService.getById(userId);
  }

  @Patch('/update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.userService.update(id, dto);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }

  @Roles('operator')
  @Post('/create')
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Roles('operator')
  @Delete('/delete')
  async deleteMany(@Body() ids: string[]) {
    return await this.userService.deleteMany(ids);
  }
}
