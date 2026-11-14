import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import { UpsertSeoDto } from './dto/upsert-seo.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SeoEntityType } from '../common/enums/seo-entity.enum';

@Controller('seo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get()
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  findAll(
    @Query('entityType') entityType?: SeoEntityType,
    @Query('entityId') entityId?: string,
  ) {
    if (entityType && entityId) {
      return this.seoService.findByEntity(entityType, entityId);
    }
    return this.seoService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  findOne(@Param('id') id: string) {
    return this.seoService.findOne(id);
  }

  @Put()
  @Roles(Role.ADMIN, Role.EDITOR)
  upsert(@Body() dto: UpsertSeoDto, @CurrentUser('id') actorId: string) {
    return this.seoService.upsert(dto, actorId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.EDITOR)
  remove(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.seoService.remove(id, actorId);
  }
}
