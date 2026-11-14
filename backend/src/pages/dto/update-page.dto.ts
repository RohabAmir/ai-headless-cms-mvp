import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(
  OmitType(CreatePageDto, ['websiteId'] as const),
) {}
