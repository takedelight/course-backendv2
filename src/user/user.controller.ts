import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/set-role.decoratos';
import { type Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
@UseGuards(RolesGuard)
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @Roles('operator')
  async getAll() {
    return await this.userService.getAll();
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
  @Post('/generate/:count')
  async generateUsers(
    @Param('count', ParseIntPipe) count: number,
    @Body() dto: { password: string },
  ) {
    return this.userService.generateUsers(count, dto.password);
  }

  @Roles('operator')
  @Delete('/delete')
  async deleteMany(@Body() ids: string[]) {
    return await this.userService.deleteMany(ids);
  }

  @Roles('operator')
  @Delete('/deleteAll')
  async deleteAll() {
    return await this.userService.deleteAllUsers();
  }
}
