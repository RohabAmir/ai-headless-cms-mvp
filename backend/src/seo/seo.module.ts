import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeoSetting } from './seo-setting.entity';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SeoSetting])],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
