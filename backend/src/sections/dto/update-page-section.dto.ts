import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class UpdatePageSectionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsObject()
  contentOverride?: Record<string, unknown> | null;
}
