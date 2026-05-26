import { IsNumber, IsString } from 'class-validator';

export class CreateCarDto {
  @IsString()
  brand: string;
  @IsString()
  modelName: string;
  @IsNumber()
  year: number;
  @IsString()
  vin: string;
  @IsString()
  plateNumber: string;
}
