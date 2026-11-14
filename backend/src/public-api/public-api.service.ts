import { Injectable, NotFoundException } from '@nestjs/common';
import { WebsitesService } from '../websites/websites.service';
import { PagesService } from '../pages/pages.service';
import { SeoService } from '../seo/seo.service';
import { SeoEntityType } from '../common/enums/seo-entity.enum';

@Injectable()
export class PublicApiService {
  constructor(
    private readonly websitesService: WebsitesService,
    private readonly pagesService: PagesService,
    private readonly seoService: SeoService,
  ) {}

  async getPageBySlugs(siteSlug: string, pageSlug: string) {
    const website = await this.websitesService.findBySlug(siteSlug);
    const page = await this.pagesService.findByWebsiteAndSlug(
      website.id,
      pageSlug,
    );

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const pageSections = (page.pageSections ?? []).sort(
      (a, b) => a.order - b.order,
    );

    const [pageSeo, siteSeo] = await Promise.all([
      this.seoService.findByEntity(SeoEntityType.PAGE, page.id),
      this.seoService.findByEntity(SeoEntityType.SITE, website.id),
    ]);

    return {
      site: {
        id: website.id,
        name: website.name,
        slug: website.slug,
        url: website.url,
      },
      page: {
        id: page.id,
        name: page.name,
        slug: page.slug,
        status: page.status,
        parentId: page.parentId,
      },
      sections: pageSections.map((ps) => ({
        id: ps.id,
        order: ps.order,
        type: ps.section.type,
        name: ps.section.name,
        content: ps.contentOverride ?? ps.section.content,
      })),
      seo: pageSeo ?? siteSeo,
    };
  }
}
