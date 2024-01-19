import { Controller, Get, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('metris')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('/:fileId')
  async getAllMetrics(@Param('fileId') fileId: string) {
    return {
      mrrPorMes: await this.metricsService.calculateMRR(fileId),
      churn: await this.metricsService.calculateChurnRate(fileId),
    };
  }
}
