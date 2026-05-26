import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';

import { SorterModule } from './sorter/sorter.module';
import { Module } from '@nestjs/common';
import { MockModule } from './mock/mock.module';
import { PrismaModule } from './prisma/prisma.module';
import { CarModule } from './car/car.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    TicketModule,
    SorterModule,
    MockModule,
    PrismaModule,
    CarModule,
  ],
})
export class AppModule {}
