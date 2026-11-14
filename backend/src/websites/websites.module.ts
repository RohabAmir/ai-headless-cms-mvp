import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Website } from './website.entity';
import { WebsitesService } from './websites.service';
import { WebsitesController } from './websites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Website])],
  controllers: [WebsitesController],
  providers: [WebsitesService],
  exports: [WebsitesService],
})
export class WebsitesModule {}
