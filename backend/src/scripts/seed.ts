import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Website } from '../websites/website.entity';
import { Page } from '../pages/page.entity';
import { Section } from '../sections/section.entity';
import { PageSection } from '../sections/page-section.entity';
import { Category } from '../categories/category.entity';
import { Post } from '../posts/post.entity';
import { SeoSetting } from '../seo/seo-setting.entity';
import { ActivityLog } from '../activity-logs/activity-log.entity';
import { Role } from '../common/enums/role.enum';
import { PageStatus } from '../common/enums/page-status.enum';
import { PostStatus } from '../common/enums/post-status.enum';
import { SeoEntityType } from '../common/enums/seo-entity.enum';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  // Allow DATABASE_URL from the shell to win over .env
  override: false,
});

async function seed() {
  const url = process.env.DATABASE_URL;
  const dataSource = new DataSource({
    type: 'postgres',
    ...(url
      ? { url }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'cms',
          password: process.env.DB_PASSWORD || 'cms',
          database: process.env.DB_DATABASE || 'ai_headless_cms',
        }),
    uuidExtension: 'pgcrypto',
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
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected. Clearing and seeding...');

  await dataSource.query(`
    TRUNCATE TABLE
      activity_logs,
      page_sections,
      seo_settings,
      posts,
      categories,
      pages,
      sections,
      websites,
      users
    RESTART IDENTITY CASCADE
  `);

  const usersRepo = dataSource.getRepository(User);
  const admin = await usersRepo.save(
    usersRepo.create({
      email: 'admin@cms.com',
      name: 'Admin User',
      role: Role.ADMIN,
      password: await bcrypt.hash('Admin@123', 10),
    }),
  );
  const editor = await usersRepo.save(
    usersRepo.create({
      email: 'editor@cms.com',
      name: 'Editor User',
      role: Role.EDITOR,
      password: await bcrypt.hash('Editor@123', 10),
    }),
  );
  await usersRepo.save(
    usersRepo.create({
      email: 'viewer@cms.com',
      name: 'Viewer User',
      role: Role.VIEWER,
      password: await bcrypt.hash('Viewer@123', 10),
    }),
  );

  const websitesRepo = dataSource.getRepository(Website);
  const website = await websitesRepo.save(
    websitesRepo.create({
      name: 'Tourism Demo',
      slug: 'tourism-demo',
      url: 'https://tourism-demo.example.com',
      description: 'Sample tourism website for headless CMS demo',
    }),
  );

  const pagesRepo = dataSource.getRepository(Page);
  const home = await pagesRepo.save(
    pagesRepo.create({
      name: 'Home',
      slug: 'home',
      websiteId: website.id,
      status: PageStatus.ACTIVE,
      parentId: null,
    }),
  );
  const about = await pagesRepo.save(
    pagesRepo.create({
      name: 'About',
      slug: 'about',
      websiteId: website.id,
      status: PageStatus.ACTIVE,
      parentId: null,
    }),
  );
  const destinations = await pagesRepo.save(
    pagesRepo.create({
      name: 'Destinations',
      slug: 'destinations',
      websiteId: website.id,
      status: PageStatus.ACTIVE,
      parentId: null,
    }),
  );

  const sectionsRepo = dataSource.getRepository(Section);
  const hero = await sectionsRepo.save(
    sectionsRepo.create({
      name: 'Hero',
      type: 'hero',
      description: 'Full-bleed hero banner',
      content: {
        headline: 'Discover Unforgettable Journeys',
        subheadline: 'Curated tourism experiences powered by our headless CMS',
        ctaLabel: 'Explore Destinations',
        ctaHref: '/destinations',
        backgroundImage: 'https://images.example.com/hero-tourism.jpg',
      },
    }),
  );
  const features = await sectionsRepo.save(
    sectionsRepo.create({
      name: 'Features',
      type: 'features',
      description: 'Feature grid',
      content: {
        title: 'Why Travel With Us',
        items: [
          {
            title: 'Local Experts',
            description: 'Guides who know every hidden gem',
            icon: 'map',
          },
          {
            title: 'Flexible Plans',
            description: 'Customize itineraries on the fly',
            icon: 'calendar',
          },
          {
            title: 'Safe & Secure',
            description: '24/7 support wherever you roam',
            icon: 'shield',
          },
        ],
      },
    }),
  );
  const cta = await sectionsRepo.save(
    sectionsRepo.create({
      name: 'CTA',
      type: 'cta',
      description: 'Call to action band',
      content: {
        title: 'Ready for your next adventure?',
        body: 'Get a personalized trip plan in minutes.',
        buttonLabel: 'Start Planning',
        buttonHref: '/contact',
      },
    }),
  );

  const pageSectionsRepo = dataSource.getRepository(PageSection);
  await pageSectionsRepo.save([
    pageSectionsRepo.create({
      pageId: home.id,
      sectionId: hero.id,
      order: 0,
      contentOverride: null,
    }),
    pageSectionsRepo.create({
      pageId: home.id,
      sectionId: features.id,
      order: 1,
      contentOverride: null,
    }),
    pageSectionsRepo.create({
      pageId: home.id,
      sectionId: cta.id,
      order: 2,
      contentOverride: null,
    }),
    pageSectionsRepo.create({
      pageId: about.id,
      sectionId: hero.id,
      order: 0,
      contentOverride: {
        headline: 'Our Story',
        subheadline: 'Passionate travelers building better trips',
        ctaLabel: 'Meet the Team',
        ctaHref: '/about#team',
      },
    }),
    pageSectionsRepo.create({
      pageId: about.id,
      sectionId: features.id,
      order: 1,
      contentOverride: null,
    }),
    pageSectionsRepo.create({
      pageId: destinations.id,
      sectionId: hero.id,
      order: 0,
      contentOverride: {
        headline: 'Top Destinations',
        subheadline: 'From alpine peaks to tropical shores',
        ctaLabel: 'View All',
        ctaHref: '/destinations',
      },
    }),
    pageSectionsRepo.create({
      pageId: destinations.id,
      sectionId: cta.id,
      order: 1,
      contentOverride: null,
    }),
  ]);

  const categoriesRepo = dataSource.getRepository(Category);
  const travelTips = await categoriesRepo.save(
    categoriesRepo.create({
      name: 'Travel Tips',
      slug: 'travel-tips',
      description: 'Practical advice for travelers',
    }),
  );
  const destinationsCat = await categoriesRepo.save(
    categoriesRepo.create({
      name: 'Destinations',
      slug: 'destinations',
      description: 'Guides to places around the world',
    }),
  );

  const postsRepo = dataSource.getRepository(Post);
  await postsRepo.save([
    postsRepo.create({
      title: '10 Packing Essentials for Mountain Trips',
      slug: 'packing-essentials-mountain',
      content:
        'Layering, hydration, and the right footwear make all the difference...',
      excerpt: 'What to pack before you hit the trails.',
      status: PostStatus.PUBLISHED,
      categoryId: travelTips.id,
      authorId: editor.id,
      publishedAt: new Date(),
    }),
    postsRepo.create({
      title: 'Hidden Beaches of the Mediterranean',
      slug: 'hidden-beaches-mediterranean',
      content:
        'Skip the crowds and discover quieter coves with crystal-clear water...',
      excerpt: 'A shortlist of under-the-radar coastal gems.',
      status: PostStatus.PUBLISHED,
      categoryId: destinationsCat.id,
      authorId: admin.id,
      publishedAt: new Date(),
    }),
    postsRepo.create({
      title: 'Draft: City Walking Routes',
      slug: 'city-walking-routes',
      content: 'Work in progress itinerary for urban explorers.',
      excerpt: null,
      status: PostStatus.DRAFT,
      categoryId: travelTips.id,
      authorId: editor.id,
      publishedAt: null,
    }),
  ]);

  const seoRepo = dataSource.getRepository(SeoSetting);
  await seoRepo.save([
    seoRepo.create({
      entityType: SeoEntityType.SITE,
      entityId: website.id,
      title: 'Tourism Demo | Headless CMS',
      description:
        'Explore destinations, plan trips, and manage content via JSON APIs.',
      keywords: ['tourism', 'travel', 'headless cms'],
      ogImage: 'https://images.example.com/og-tourism.jpg',
    }),
    seoRepo.create({
      entityType: SeoEntityType.PAGE,
      entityId: home.id,
      title: 'Home | Tourism Demo',
      description: 'Welcome to Tourism Demo — discover your next journey.',
      keywords: ['home', 'tourism', 'travel'],
      ogImage: 'https://images.example.com/og-home.jpg',
    }),
    seoRepo.create({
      entityType: SeoEntityType.PAGE,
      entityId: about.id,
      title: 'About Us | Tourism Demo',
      description: 'Learn about our mission and travel experts.',
      keywords: ['about', 'team'],
      ogImage: null,
    }),
  ]);

  const logsRepo = dataSource.getRepository(ActivityLog);
  await logsRepo.save([
    logsRepo.create({
      userId: admin.id,
      entity: 'Website',
      entityId: website.id,
      action: 'CREATE',
      metadata: { slug: website.slug },
    }),
    logsRepo.create({
      userId: admin.id,
      entity: 'Page',
      entityId: home.id,
      action: 'CREATE',
      metadata: { slug: 'home' },
    }),
    logsRepo.create({
      userId: editor.id,
      entity: 'Post',
      entityId: null,
      action: 'CREATE',
      metadata: { slug: 'packing-essentials-mountain' },
    }),
    logsRepo.create({
      userId: admin.id,
      entity: 'SeoSetting',
      entityId: null,
      action: 'CREATE',
      metadata: { entityType: 'SITE' },
    }),
  ]);

  console.log('Seed complete.');
  console.log('Users:');
  console.log('  admin@cms.com / Admin@123 (ADMIN)');
  console.log('  editor@cms.com / Editor@123 (EDITOR)');
  console.log('  viewer@cms.com / Viewer@123 (VIEWER)');
  console.log(`Website: ${website.name} (slug: ${website.slug})`);
  console.log(
    `Public API example: GET /api/v1/sites/${website.slug}/pages/home`,
  );

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
