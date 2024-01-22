import { Injectable } from '@nestjs/common';
import { Define } from 'agenda-nest';

@Injectable()
export class JobService {
  @Define('meu job')
  async meuJob() {
    // Exemplo de tarefa demorada que não bloqueia o loop de eventos
    for (let i = 0; i < 1000; i++) {
      // Processamento que leva tempo
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
}
