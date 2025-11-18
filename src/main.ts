import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({}));

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN'),
    methods: 'GET,HEAD,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(config.getOrThrow<number>('PORT'));
}
bootstrap().catch((e) => console.error(e));
