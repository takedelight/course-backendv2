import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { ExtractUserId } from 'src/shared/decorators/extract-user-id.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { type SortOrder } from 'src/shared/types/sorter.types';

@ApiTags('Авто')
@Controller('car')
@UseGuards(AuthGuard)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get('/')
  @ApiOperation({ summary: 'Отримати всі авто поточного користувача' })
  @ApiResponse({ status: 200, description: 'Список авто' })
  async getAll(
    @ExtractUserId() userId: string,
    @Query('q') q: string,
    @Query('status') status: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: SortOrder,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.carService.getAllCars(userId, {
      limit,
      page,
      q,
      sortBy,
      sortOrder,
      status,
    });
  }

  @Post('')
  @ApiOperation({ summary: 'Створити авто для поточного користувача' })
  @ApiBody({ type: CreateCarDto })
  @ApiResponse({ status: 201, description: 'Авто створено' })
  async create(@ExtractUserId() userId: string, @Body() dto: CreateCarDto) {
    return await this.carService.create(userId, dto);
  }

  @Patch('/update/:id')
  @ApiOperation({ summary: 'Оновити авто за id' })
  @ApiBody({ type: UpdateCarDto })
  @ApiResponse({ status: 200, description: 'Авто оновлено' })
  async update(
    @ExtractUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarDto,
  ) {
    return await this.carService.update(userId, id, dto);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Видалити авто за id' })
  @ApiResponse({ status: 200, description: 'Авто видалено' })
  async delete(@ExtractUserId() userId: string, @Param('id') id: string) {
    return await this.carService.delete(userId, id);
  }
}
