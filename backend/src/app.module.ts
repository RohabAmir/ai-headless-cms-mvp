import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WebsitesModule } from './websites/websites.module';
import { PagesModule } from './pages/pages.module';
import { SectionsModule } from './sections/sections.module';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';
import { SeoModule } from './seo/seo.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicApiModule } from './public-api/public-api.module';
import { User } from './users/user.entity';
import { Website } from './websites/website.entity';
import { Page } from './pages/page.entity';
import { Section } from './sections/section.entity';
import { PageSection } from './sections/page-section.entity';
import { Category } from './categories/category.entity';
import { Post } from './posts/post.entity';
import { SeoSetting } from './seo/seo-setting.entity';
import { ActivityLog } from './activity-logs/activity-log.entity';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        const base = {
          type: 'postgres' as const,
          uuidExtension: 'pgcrypto' as const,
          entities: [
            User,
            Website,
            Page,
            Section,
            PageSection,
            Category,
            Post,
            SeoSetting,
            ActivityLog,
          ],
          synchronize: config.get<string>('TYPEORM_SYNC', 'true') === 'true',
          logging: config.get<string>('TYPEORM_LOGGING', 'false') === 'true',
        };

        if (url) {
          return { ...base, url };
        }

        return {
          ...base,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
          username: config.get<string>('DB_USERNAME', 'cms'),
          password: config.get<string>('DB_PASSWORD', 'cms'),
          database: config.get<string>('DB_DATABASE', 'ai_headless_cms'),
        };
      },
    }),
    ActivityLogsModule,
    UsersModule,
    AuthModule,
    WebsitesModule,
    PagesModule,
    SectionsModule,
    CategoriesModule,
    PostsModule,
    SeoModule,
    DashboardModule,
    PublicApiModule,
  ],
})
export class AppModule {}
