import { Module } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { PublicApiController } from './public-api.controller';
import { WebsitesModule } from '../websites/websites.module';
import { PagesModule } from '../pages/pages.module';
import { SeoModule } from '../seo/seo.module';

@Module({
  imports: [WebsitesModule, PagesModule, SeoModule],
  controllers: [PublicApiController],
  providers: [PublicApiService],
})
export class PublicApiModule {}
