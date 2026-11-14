import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from '../users/users.module';
import { PagesModule } from '../pages/pages.module';
import { PostsModule } from '../posts/posts.module';
import { SectionsModule } from '../sections/sections.module';
import { WebsitesModule } from '../websites/websites.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    UsersModule,
    PagesModule,
    PostsModule,
    SectionsModule,
    WebsitesModule,
    ActivityLogsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
