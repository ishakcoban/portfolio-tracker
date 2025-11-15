import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortfolioModule } from './portfolio/portfolio.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [PortfolioModule],
})
export class AppModule {}
