import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { FileEntity } from 'src/file/entities/file.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(FileEntity)
    private _fileRepository: MongoRepository<FileEntity>,
  ) {}

  async getMetrics(fileId: string) {
    const file: FileEntity = await this._fileRepository.findOne({
      where: {
        _id: new ObjectId(fileId),
      },
    });

    if (!file.data) {
      return {
        status: file.status,
        mrr: {},
        churnRate: {},
      };
    }

    const mrr = await this.calculateMRR(file);
    const churnRate = await this.calculateChurnRate(file);

    return {
      status: file.status,
      mrr,
      churnRate,
    };
  }

  // Este método deve ser implementado para realizar os cálculos
  async calculateMRR({ data }: FileEntity) {
    const mrrPorMes = new Map<string, number>();

    data.forEach((assinatura) => {
      const valor = parseFloat(assinatura.valor.toString().replace(',', '.'));
      const frequenciaCobrancaDias = assinatura['cobrada a cada X dias'];
      const mesEAno = this.extrairMesEAno(
        assinatura['data início'] || assinatura['próximo ciclo'],
      );

      let valorMensal = valor;
      if (frequenciaCobrancaDias === 365) {
        valorMensal = valor / 12;
      }

      if (mrrPorMes.has(mesEAno)) {
        mrrPorMes.set(mesEAno, mrrPorMes.get(mesEAno) + valorMensal);
      } else {
        mrrPorMes.set(mesEAno, valorMensal);
      }
    });

    return {
      ...Object.fromEntries(mrrPorMes),
    };
  }

  async calculateChurnRate({ data }: FileEntity) {
    const churnPorMes = new Map<string, number>();
    const totalAssinantesPorMes = new Map<string, number>();

    data.forEach((assinatura) => {
      const mesEAno = this.extrairMesEAno(
        assinatura['data início'] || assinatura['próximo ciclo'],
      );

      // Contar total de assinantes no início de cada mês
      if (totalAssinantesPorMes.has(mesEAno)) {
        totalAssinantesPorMes.set(
          mesEAno,
          totalAssinantesPorMes.get(mesEAno) + 1,
        );
      } else {
        totalAssinantesPorMes.set(mesEAno, 1);
      }

      // Contar cancelamentos por mês
      if (assinatura.status !== 'Ativa' && assinatura['data cancelamento']) {
        const mesCancelamento = this.extrairMesEAno(
          assinatura['data cancelamento'],
        );

        if (churnPorMes.has(mesCancelamento)) {
          churnPorMes.set(
            mesCancelamento,
            churnPorMes.get(mesCancelamento) + 1,
          );
        } else {
          churnPorMes.set(mesCancelamento, 1);
        }
      }
    });

    const churnRatePorMes = new Map<string, number>();
    churnPorMes.forEach((cancelamentos, mes) => {
      const totalAssinantes = totalAssinantesPorMes.get(mes) || 0;
      const churnRate =
        totalAssinantes > 0 ? (cancelamentos / totalAssinantes) * 100 : 0;
      churnRatePorMes.set(mes, churnRate);
    });

    return {
      ...Object.fromEntries(churnRatePorMes),
    };
  }

  private extrairMesEAno(dataString: string): string {
    // Convertendo 'dd/mm/yyyy' ou 'dd/mm/yy' para 'mm/dd/yyyy'
    const partes = dataString.split('/');
    const dia = partes[0];
    const mes = partes[1];
    let ano = partes[2];

    // Convertendo ano de dois dígitos para quatro dígitos
    if (ano.length === 2) {
      ano = '20' + ano; // Isso funciona para anos a partir do ano 2000
    }

    // Criando um objeto Date
    const data = new Date(`${mes}/${dia}/${ano}`);

    // Extraindo mês e ano
    const mesFormatado = data.getMonth() + 1; // getMonth() retorna 0-11
    const anoFormatado = data.getFullYear();

    // Formatando como 'mm/yyyy'
    return `${mesFormatado}/${anoFormatado}`;
  }
}
