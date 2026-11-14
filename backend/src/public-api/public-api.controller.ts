import { Controller, Get, Param } from '@nestjs/common';
import { PublicApiService } from './public-api.service';

@Controller('api/v1')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('sites/:siteSlug/pages/:pageSlug')
  getPage(
    @Param('siteSlug') siteSlug: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    return this.publicApiService.getPageBySlugs(siteSlug, pageSlug);
  }
}
