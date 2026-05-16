import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Реєстрація авто' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'WVWZZZ1JZXW000001' })
  @IsString()
  VIN: string;
}
