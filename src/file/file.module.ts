import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { JobModule } from 'src/job/job.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), JobModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
