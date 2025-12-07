import { Module } from '@nestjs/common';
import { SorterService } from './sorter.service';

@Module({
  providers: [SorterService],
})
export class SorterModule {}
