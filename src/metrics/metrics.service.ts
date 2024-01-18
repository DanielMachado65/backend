import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  // Este método deve ser implementado para realizar os cálculos
  calculateMRRAndChurn(): any {
    // Lógica para calcular MRR e Churn Rate
    // ...
    return {
      mrr: null,
      churnRate: null,
    };
  }
}
