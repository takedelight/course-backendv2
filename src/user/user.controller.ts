import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
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

  @Patch('/update')
  async update(@Req() req: Request, @Body() dto: UpdateUserDto) {
    return await this.userService.update(req.user.sub, dto);
  }

  @Delete('/delete')
  async delete(@Req() req: Request) {
    return await this.userService.delete(req.user.sub);
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
}
