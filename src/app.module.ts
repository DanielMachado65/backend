import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from './metrics/metrics.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { JobModule } from './job/job.module';

@Module({
  imports: [
    MetricsModule,
    FileUploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGO_URL,
      entities: [join(__dirname, '**/**.entity{.ts,.js}')],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    JobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('AppModule loaded');
  }
}
