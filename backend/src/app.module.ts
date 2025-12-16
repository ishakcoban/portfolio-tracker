import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AssetModule } from './asset/asset.module';
import { TransactionModule } from './transaction/transaction.module';
import { PortfolioDailyChangeModule } from './portfolio-daily-change/portfolio-daily-change.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [PortfolioModule, AssetModule, TransactionModule, PortfolioDailyChangeModule],
})
export class AppModule {}
