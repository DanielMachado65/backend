import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('metris')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('mrr-churn')
  getMRRAndChurn() {
    return this.metricsService.calculateMRRAndChurn();
  }
}
