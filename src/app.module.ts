import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { User } from './user/entities/user.entity';
import { Ticket } from './ticket/entities/ticket.entity';
import { ProfileModule } from './profile/profile.module';
import { RequestLog } from './profile/shared/middlewares/request-log.middleware';
import { SorterModule } from './sorter/sorter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DATABASE_HOST'),
        port: config.getOrThrow<number>('DATABASE_PORT'),
        username: config.getOrThrow<string>('DATABASE_USERNAME'),
        password: config.getOrThrow<string>('DATABASE_PASSWORD'),
        database: config.getOrThrow<string>('DATABASE_NAME'),
        entities: [User, Ticket],
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
    TicketModule,
    ProfileModule,
    SorterModule,
  ],
})
export class AppModule {}
