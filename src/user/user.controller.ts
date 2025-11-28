import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/set-role.decoratos';
import { type Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

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
}
