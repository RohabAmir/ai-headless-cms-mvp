import { IsInt, IsObject, IsOptional, IsUUID, Min } from 'class-validator';

export class AttachSectionDto {
  @IsUUID()
  sectionId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsObject()
  contentOverride?: Record<string, unknown>;
}
