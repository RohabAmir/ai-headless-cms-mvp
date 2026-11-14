import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PagesService } from '../pages/pages.service';
import { PostsService } from '../posts/posts.service';
import { SectionsService } from '../sections/sections.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { WebsitesService } from '../websites/websites.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly pagesService: PagesService,
    private readonly postsService: PostsService,
    private readonly sectionsService: SectionsService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly websitesService: WebsitesService,
  ) {}

  async getStats() {
    const [users, pages, posts, sections, websites, activityOverTime] =
      await Promise.all([
        this.usersService.count(),
        this.pagesService.count(),
        this.postsService.count(),
        this.sectionsService.count(),
        this.websitesService.count(),
        this.activityLogsService.getActivityOverTime(30),
      ]);

    const leadsOverTime = activityOverTime.map(
      (point: { date: string; count: number }, index: number) => ({
        date: point.date,
        count: Math.max(0, Math.round(point.count * 0.3) + (index % 3)),
      }),
    );

    return {
      counts: { users, pages, posts, sections, websites },
      activityOverTime,
      leadsOverTime,
    };
  }
}
