import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Реєстрація авто' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'WVWZZZ1JZXW000001' })
  @IsString()
  VIN: string;

  @ApiProperty({
    example: '6983059f-da5c-4559-8777-0344e1b52d87',
    description: 'ID автомобіля з бази даних',
  })
  @IsUUID()
  carId: string;
}
