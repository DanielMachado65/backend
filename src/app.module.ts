import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from './metrics/metrics.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { mFileModelDef } from './file-upload/entities/file.entity';

const modelDefinitions: ReadonlyArray<ModelDefinition> = [mFileModelDef];

@Module({
  imports: [
    MetricsModule,
    FileUploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: 'mongodb://root:senha@localhost:27017',
      }),
    }),
    MongooseModule.forFeatureAsync(
      modelDefinitions.map((modelDefinition) => ({
        name: modelDefinition.name,
        useFactory: () => modelDefinition.schema,
      })),
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('AppModule loaded');
  }
}
