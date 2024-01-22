import { Module } from '@nestjs/common';
import { AgendaModule } from 'agenda-nest';
import { FileJobService } from './file-job.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/file-upload/entities/file.entity';

@Module({
  imports: [
    AgendaModule.forRoot({
      db: {
        address: 'mongodb://root:senha@localhost:27017',
        collection: 'agendaJobs',
      },
    }),
    AgendaModule.registerQueue('notifications', {
      processEvery: '1 minutes',
      autoStart: false, // default: true
      collection: 'notificationsqueue', // default: notifications-queue (`${queueName}-queue`)
    }),
    TypeOrmModule.forFeature([FileEntity]),
  ],
  providers: [FileJobService],
  exports: [FileJobService],
})
export class JobModule {}
