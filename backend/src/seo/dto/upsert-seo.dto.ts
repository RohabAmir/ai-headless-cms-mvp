import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { SeoEntityType } from '../../common/enums/seo-entity.enum';

export class UpsertSeoDto {
  @IsEnum(SeoEntityType)
  entityType!: SeoEntityType;

  @IsUUID()
  entityId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsUrl({ require_tld: false })
  ogImage?: string;
}
