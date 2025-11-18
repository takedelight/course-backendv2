import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/set-role.decoratos';

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
}
