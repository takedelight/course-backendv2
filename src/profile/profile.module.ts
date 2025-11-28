import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [ProfileController],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ProfileService, UserService],
})
export class ProfileModule {}
