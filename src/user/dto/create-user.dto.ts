import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Іван' })
  @IsString({ message: "Ім'я має бути рядком" })
  @MinLength(2, { message: "Ім'я має містити мінімум 2 символи" })
  firstName: string;

  @ApiProperty({ example: 'Петренко' })
  @IsString({ message: 'Прізвище має бути рядком' })
  @MinLength(2, { message: 'Прізвище має містити мінімум 2 символи' })
  lastName: string;

  @ApiProperty({ example: 'student@example.com' })
  @IsEmail({}, { message: 'Некоректний формат електронної пошти' })
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString({ message: 'Пароль має бути рядком' })
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password: string;
}
