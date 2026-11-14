import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { AttachSectionDto } from './dto/attach-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { UpdatePageSectionDto } from './dto/update-page-section.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post('sections')
  @Roles(Role.ADMIN, Role.EDITOR)
  create(@Body() dto: CreateSectionDto, @CurrentUser('id') actorId: string) {
    return this.sectionsService.create(dto, actorId);
  }

  @Get('sections')
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get('sections/:id')
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch('sections/:id')
  @Roles(Role.ADMIN, Role.EDITOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.sectionsService.update(id, dto, actorId);
  }

  @Delete('sections/:id')
  @Roles(Role.ADMIN, Role.EDITOR)
  remove(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.sectionsService.remove(id, actorId);
  }

  @Get('pages/:pageId/sections')
  @Roles(Role.ADMIN, Role.EDITOR, Role.VIEWER)
  getPageSections(@Param('pageId') pageId: string) {
    return this.sectionsService.getPageSections(pageId);
  }

  @Post('pages/:pageId/sections')
  @Roles(Role.ADMIN, Role.EDITOR)
  attach(
    @Param('pageId') pageId: string,
    @Body() dto: AttachSectionDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.sectionsService.attachToPage(pageId, dto, actorId);
  }

  @Post('pages/:pageId/sections/reorder')
  @Roles(Role.ADMIN, Role.EDITOR)
  reorder(
    @Param('pageId') pageId: string,
    @Body() dto: ReorderSectionsDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.sectionsService.reorder(pageId, dto, actorId);
  }

  @Patch('pages/:pageId/sections/:pageSectionId')
  @Roles(Role.ADMIN, Role.EDITOR)
  updatePageSection(
    @Param('pageId') pageId: string,
    @Param('pageSectionId') pageSectionId: string,
    @Body() dto: UpdatePageSectionDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.sectionsService.updatePageSection(
      pageId,
      pageSectionId,
      dto,
      actorId,
    );
  }

  @Delete('pages/:pageId/sections/:pageSectionId')
  @Roles(Role.ADMIN, Role.EDITOR)
  detach(
    @Param('pageId') pageId: string,
    @Param('pageSectionId') pageSectionId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return this.sectionsService.detachFromPage(pageId, pageSectionId, actorId);
  }
}
