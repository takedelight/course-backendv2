import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: "Ім'я має бути рядком" })
  @MinLength(2, { message: "Ім'я має містити мінімум 2 символи" })
  firstName: string;

  @IsString({ message: 'Прізвище має бути рядком' })
  @MinLength(2, { message: 'Прізвище має містити мінімум 2 символи' })
  lastName: string;

  @IsEmail({}, { message: 'Некоректний формат електронної пошти' })
  email: string;
  @IsString({ message: 'Пароль має бути рядком' })
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password: string;
}
