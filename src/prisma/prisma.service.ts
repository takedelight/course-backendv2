import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
    super({
      adapter: new PrismaPg(new Pool({ connectionString: databaseUrl })),
    });
  }
}
