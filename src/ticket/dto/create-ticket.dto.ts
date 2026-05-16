import { IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  type: string;

  @IsString()
  VIN: string;
}
