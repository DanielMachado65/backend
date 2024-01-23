import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from './metrics/metrics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { JobModule } from './job/job.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    MetricsModule,
    FileModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'reports',
      username: 'admin',
      password: 'senha',
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
