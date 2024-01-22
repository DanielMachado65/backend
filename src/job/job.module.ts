import { Module } from '@nestjs/common';
import { AgendaModule } from 'agenda-nest';
import { JobService } from './job.service';

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
  ],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
